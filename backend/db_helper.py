import os
import sys
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal
import json
import re
import math
import urllib.parse
from contextlib import contextmanager

import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("db_helper")
logging.basicConfig(level=logging.INFO)

class DatabaseHelper:
    def __init__(self, db_url: str = None, db_path: str = None):
        self._cache = {}
        self.db_url = self._resolve_db_url(db_url)
        # Preserve original SQLite database file path as backup (untouched)
        self.db_path = self._resolve_sqlite_backup_path(db_path)
        self._pool = None
        self._schemas = {}
        self._id_map = {}
        self._token_pattern = None

        self._init_connection()

    def _resolve_sqlite_backup_path(self, explicit_path: str = None) -> str:
        if explicit_path and os.path.exists(explicit_path):
            return explicit_path

        env_path = os.environ.get("DATABASE_PATH")
        if env_path and os.path.exists(env_path):
            return env_path

        base_dir = os.path.dirname(os.path.abspath(__file__))
        for cand in [
            os.path.join(base_dir, "crime_intelligence.db"),
            os.path.join(os.path.dirname(base_dir), "crime_intelligence.db"),
            os.path.join(os.path.dirname(os.path.dirname(base_dir)), "crime_intelligence.db"),
            "c:/AICrimeAnalytics-main/backend/crime_intelligence.db"
        ]:
            if os.path.exists(cand):
                return cand
        return "crime_intelligence.db"

    def _resolve_db_url(self, explicit_url: str = None) -> str:
        if explicit_url:
            return explicit_url

        # Check environment variables
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url

        # Check backend/.env file
        env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        if not os.path.exists(env_file):
            env_file = "c:/AICrimeAnalytics-main/backend/.env"

        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val

        # Fallback to standard environment parameters
        host = os.environ.get("PGHOST", "127.0.0.1")
        port = os.environ.get("PGPORT", "5432")
        dbname = os.environ.get("PGDATABASE", "crime_intelligence")
        user = os.environ.get("PGUSER", "postgres")
        password = os.environ.get("PGPASSWORD", "PASSWORD")
        return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

    def _init_connection(self):
        try:
            url_to_connect = self.db_url
            if url_to_connect.startswith("postgres://"):
                url_to_connect = url_to_connect.replace("postgres://", "postgresql://", 1)

            # Safely extract database name without exposing passwords
            parsed = urllib.parse.urlparse(url_to_connect)
            db_name = parsed.path.lstrip("/") or "crime_intelligence"

            self._pool = ThreadedConnectionPool(1, 20, url_to_connect)

            # Verification query to confirm connection
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1;")
                    cur.fetchone()

            # Output connection success message without secrets
            print("PostgreSQL connection successful")
            print(f"Database: {db_name}")
            logger.info(f"PostgreSQL connection successful. Database: {db_name}")

            self._init_schemas()

        except Exception as e:
            logger.exception("Failed to connect to PostgreSQL database:")
            raise

    @contextmanager
    def get_connection(self):
        if not self._pool:
            raise RuntimeError("Database connection pool is not initialized.")
        conn = self._pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
        finally:
            self._pool.putconn(conn)

    def _init_schemas(self):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT table_name, column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public'
                """)
                self._schemas = {}
                tables = set()
                columns = set()
                for t, c in cur.fetchall():
                    self._schemas.setdefault(t, []).append(c)
                    tables.add(t)
                    columns.add(c)

        all_ids = sorted(list(tables | columns), key=len, reverse=True)
        self._token_pattern = re.compile(r'"[^"]*"|\'[^\']*\'|(\b[A-Za-z_][A-Za-z0-9_]*\b)')
        self._id_map = {name.lower(): name for name in all_ids}

    def _get_sqlite_schemas(self, conn=None):
        """Backward-compatible helper returning dictionary of tables and columns."""
        return self._schemas

    def _prepare_sql(self, sql: str) -> str:
        """
        Converts SQLite-specific syntax into PostgreSQL-compatible SQL:
        - strftime('%Y-%m', col) -> TO_CHAR(col, 'YYYY-MM')
        - strftime('%Y', col) -> TO_CHAR(col, 'YYYY')
        - sqlite_master -> information_schema.tables
        - ? placeholders -> %s
        - Quotes case-sensitive identifiers
        """
        sql = re.sub(r"strftime\s*\(\s*['\"]%Y-%m['\"]\s*,\s*([^\)]+)\)", r"TO_CHAR(\1, 'YYYY-MM')", sql, flags=re.IGNORECASE)
        sql = re.sub(r"strftime\s*\(\s*['\"]%Y['\"]\s*,\s*([^\)]+)\)", r"TO_CHAR(\1, 'YYYY')", sql, flags=re.IGNORECASE)
        sql = re.sub(r"sqlite_master\s+WHERE\s+type=['\"]table['\"]", "information_schema.tables WHERE table_schema='public'", sql, flags=re.IGNORECASE)
        sql = re.sub(r"SELECT\s+name\s+FROM\s+sqlite_master", "SELECT table_name as name FROM information_schema.tables WHERE table_schema='public'", sql, flags=re.IGNORECASE)

        # Replace parameter placeholder ? with %s outside quotes
        def replace_placeholders(match):
            text = match.group(0)
            if text.startswith("'") or text.startswith('"'):
                return text
            return text.replace("?", "%s")
        sql = re.sub(r"'[^']*'|\"[^\"]*\"|\?", replace_placeholders, sql)

        # Quote known table and column identifiers if not already quoted
        def replace_token(match):
            quoted_or_word = match.group(0)
            if quoted_or_word.startswith('"') or quoted_or_word.startswith("'"):
                return quoted_or_word
            word_lower = quoted_or_word.lower()
            if word_lower in self._id_map:
                real_case = self._id_map[word_lower]
                return f'"{real_case}"'
            return quoted_or_word

        if self._token_pattern:
            sql = self._token_pattern.sub(replace_token, sql)

        return sql

    def execute_postgres_query(self, query: str, params=None):
        prep_query = self._prepare_sql(query)
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(prep_query, params)
                rows = cursor.fetchall()

        query_words = set(re.findall(r'\b\w+\b', query.lower()))
        active_tables = [t for t in self._schemas.keys() if t.lower() in query_words]
        if not active_tables:
            active_tables = list(self._schemas.keys())

        results = []
        for r in rows:
            mapped_row = {}
            for col_name, val in r.items():
                if isinstance(val, (date, datetime)):
                    val = val.isoformat()
                elif isinstance(val, Decimal):
                    val = float(val)

                mapped_col = col_name
                col_name_lower = col_name.lower()
                owner_table = None

                if col_name_lower.startswith("count(") and col_name_lower.endswith(")"):
                    mapped_col = "ROWID"
                    inside = col_name[6:-1]
                    if "." in inside:
                        owner_table = inside.split(".")[0]
                    else:
                        for table in active_tables:
                            cols = self._schemas[table]
                            if inside.lower() in [c.lower() for c in cols]:
                                owner_table = table
                                break
                        if not owner_table:
                            match = re.search(r'from\s+["\']?(\w+)["\']?', query, re.IGNORECASE)
                            if match:
                                owner_table = match.group(1)
                elif col_name_lower == "count":
                    mapped_col = "ROWID"
                    match = re.search(r'from\s+["\']?(\w+)["\']?', query, re.IGNORECASE)
                    if match:
                        owner_table = match.group(1)
                else:
                    for table in active_tables:
                        cols = self._schemas[table]
                        if col_name_lower in [c.lower() for c in cols]:
                            owner_table = table
                            break
                    if not owner_table:
                        for table, cols in self._schemas.items():
                            if col_name_lower in [c.lower() for c in cols]:
                                owner_table = table
                                break

                if not owner_table:
                    owner_table = "UnknownTable"

                if owner_table not in mapped_row:
                    mapped_row[owner_table] = {}
                mapped_row[owner_table][mapped_col] = val
            results.append(mapped_row)
        return results

    def execute_sqlite_query(self, query: str):
        """Backward-compatible entry point routing to PostgreSQL execution."""
        return self.execute_postgres_query(query)

    def execute_query(self, query: str, params=None):
        return self.execute_postgres_query(query, params)

    def get_lookup_table(self, table_name: str, id_col: str, name_col: str):
        cache_key = f"lookup_{table_name}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            rows = self.execute_query(f'SELECT "{id_col}", "{name_col}" FROM "{table_name}"')
            lookup = {}
            for r in rows:
                row_data = r.get(table_name, {})
                id_val = row_data.get(id_col)
                name_val = row_data.get(name_col)
                if id_val is not None:
                    lookup[int(id_val)] = name_val
            self._cache[cache_key] = lookup
            return lookup
        except Exception as e:
            logger.error(f"Failed to fetch lookup table {table_name}: {e}")
            return {}

    def get_categories(self):
        return self.get_lookup_table("CaseCategory", "CaseCategoryID", "LookupValue")

    def get_gravities(self):
        return self.get_lookup_table("GravityOffence", "GravityOffenceID", "LookupValue")

    def get_crime_heads(self):
        return self.get_lookup_table("CrimeHead", "CrimeHeadID", "CrimeGroupName")

    def get_crime_sub_heads(self):
        return self.get_lookup_table("CrimeSubHead", "CrimeSubHeadID", "CrimeHeadName")

    def get_case_statuses(self):
        return self.get_lookup_table("CaseStatusMaster", "CaseStatusID", "CaseStatusName")

    def get_caste_map(self):
        return self.get_lookup_table("CasteMaster", "caste_master_id", "caste_master_name")

    def get_religion_map(self):
        return self.get_lookup_table("ReligionMaster", "ReligionID", "ReligionName")

    def get_occupation_map(self):
        return self.get_lookup_table("OccupationMaster", "OccupationID", "OccupationName")

    def get_all_districts(self):
        return self.get_lookup_table("District", "DistrictID", "DistrictName")

    def get_all_stations(self):
        return self.get_lookup_table("Unit", "UnitID", "UnitName")

    def get_cases(self, limit: int = 25, offset: int = 0, **filters):
        query = (
            'SELECT c."CaseMasterID", c."CrimeNo", c."CaseNo", c."CrimeRegisteredDate", '
            'c."PolicePersonID", c."PoliceStationID", c."CaseCategoryID", c."GravityOffenceID", '
            'c."CrimeMajorHeadID", c."CrimeMinorHeadID", c."CaseStatusID", c."CourtID", '
            'e."FirstName", u."UnitName", co."CourtName" '
            'FROM "CaseMaster" c '
            'LEFT JOIN "Employee" e ON c."PolicePersonID" = e."EmployeeID" '
            'LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" '
            'LEFT JOIN "Court" co ON c."CourtID" = co."CourtID"'
        )

        where_clauses = []
        if filters.get("district_id"):
            where_clauses.append(f'u."DistrictID" = {int(filters["district_id"])}')
        if filters.get("station_id"):
            where_clauses.append(f'c."PoliceStationID" = {int(filters["station_id"])}')
        if filters.get("category_id"):
            where_clauses.append(f'c."CaseCategoryID" = {int(filters["category_id"])}')
        if filters.get("gravity_id"):
            where_clauses.append(f'c."GravityOffenceID" = {int(filters["gravity_id"])}')
        if filters.get("major_head_id"):
            where_clauses.append(f'c."CrimeMajorHeadID" = {int(filters["major_head_id"])}')
        if filters.get("minor_head_id"):
            where_clauses.append(f'c."CrimeMinorHeadID" = {int(filters["minor_head_id"])}')
        if filters.get("status_id"):
            where_clauses.append(f'c."CaseStatusID" = {int(filters["status_id"])}')
        if filters.get("officer_id"):
            where_clauses.append(f'c."PolicePersonID" = {int(filters["officer_id"])}')
        if filters.get("start_date"):
            escaped_start = str(filters['start_date']).replace("'", "''")
            where_clauses.append(f'c."CrimeRegisteredDate" >= \'{escaped_start}\'')
        if filters.get("end_date"):
            escaped_end = str(filters['end_date']).replace("'", "''")
            where_clauses.append(f'c."CrimeRegisteredDate" <= \'{escaped_end}\'')

        search_pattern = filters.get("search")
        if search_pattern:
            escaped = search_pattern.replace("'", "''")
            where_clauses.append(
                f'(c."CrimeNo" ILIKE \'%{escaped}%\' OR c."CaseNo" ILIKE \'%{escaped}%\' '
                f'OR e."FirstName" ILIKE \'%{escaped}%\' OR u."UnitName" ILIKE \'%{escaped}%\')'
            )

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += ' ORDER BY c."CrimeRegisteredDate" DESC'
        query += f' LIMIT {limit} OFFSET {offset}'

        rows = self.execute_query(query)

        count_query = 'SELECT COUNT(c."CaseMasterID") FROM "CaseMaster" c'
        if where_clauses:
            count_query += ' LEFT JOIN "Employee" e ON c."PolicePersonID" = e."EmployeeID" LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" WHERE ' + " AND ".join(where_clauses)
        count_rows = self.execute_query(count_query)
        total = int(count_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if count_rows else 0

        cats = self.get_categories()
        gravities = self.get_gravities()
        major_heads = self.get_crime_heads()
        minor_heads = self.get_crime_sub_heads()
        statuses = self.get_case_statuses()

        cases_list = []
        case_ids = []
        for r in rows:
            cm = r.get("CaseMaster", {})
            emp = r.get("Employee", {})
            unit = r.get("Unit", {})

            case_id = int(cm.get("CaseMasterID", 0))
            case_ids.append(case_id)

            cases_list.append({
                "id": case_id,
                "crime_no": cm.get("CrimeNo"),
                "case_no": cm.get("CaseNo"),
                "registered_date": cm.get("CrimeRegisteredDate"),
                "officer_name": emp.get("FirstName") or "N/A",
                "station_name": unit.get("UnitName") or "N/A",
                "category": cats.get(int(cm.get("CaseCategoryID", 0)), "N/A"),
                "gravity": gravities.get(int(cm.get("GravityOffenceID", 0)), "N/A"),
                "major_head": major_heads.get(int(cm.get("CrimeMajorHeadID", 0)), "N/A"),
                "minor_head": minor_heads.get(int(cm.get("CrimeMinorHeadID", 0)), "N/A"),
                "status": statuses.get(int(cm.get("CaseStatusID", 0)), "N/A"),
                "brief_facts": "Loading...",
                "lat": None,
                "lng": None
            })

        if case_ids:
            id_list_str = ", ".join(str(cid) for cid in case_ids)
            occ_rows = self.execute_query(f'SELECT "CaseMasterID", "BriefFacts", "latitude", "longitude" FROM "Inv_OccuranceTime" WHERE "CaseMasterID" IN ({id_list_str})')
            occ_map = {}
            for o in occ_rows:
                od = o.get("Inv_OccuranceTime", {})
                occ_map[int(od.get("CaseMasterID", 0))] = {
                    "brief_facts": od.get("BriefFacts", "")[:200] + "..." if od.get("BriefFacts") else "No brief facts.",
                    "lat": float(od.get("latitude")) if od.get("latitude") is not None else None,
                    "lng": float(od.get("longitude")) if od.get("longitude") is not None else None
                }

            for case in cases_list:
                occ = occ_map.get(case["id"])
                if occ:
                    case["brief_facts"] = occ["brief_facts"]
                    case["lat"] = occ["lat"]
                    case["lng"] = occ["lng"]

        return cases_list, total

    def get_case_by_id(self, case_id: int):
        query = (
            f'SELECT c."CaseMasterID", c."CrimeNo", c."CaseNo", c."CrimeRegisteredDate", '
            f'c."PolicePersonID", c."PoliceStationID", c."CaseCategoryID", c."GravityOffenceID", '
            f'c."CrimeMajorHeadID", c."CrimeMinorHeadID", c."CaseStatusID", c."CourtID", '
            f'e."FirstName", e."KGID", e."RankID", e."DesignationID", '
            f'u."UnitName", co."CourtName" '
            f'FROM "CaseMaster" c '
            f'LEFT JOIN "Employee" e ON c."PolicePersonID" = e."EmployeeID" '
            f'LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" '
            f'LEFT JOIN "Court" co ON c."CourtID" = co."CourtID" '
            f'WHERE c."CaseMasterID" = {int(case_id)}'
        )
        rows = self.execute_query(query)
        if not rows:
            return None

        r = rows[0]
        cm = r.get("CaseMaster", {})
        emp = r.get("Employee", {})
        unit = r.get("Unit", {})
        court = r.get("Court", {})

        ranks = self.get_lookup_table("Rank", "RankID", "RankName")
        designations = self.get_lookup_table("Designation", "DesignationID", "DesignationName")
        cats = self.get_categories()
        gravities = self.get_gravities()
        major_heads = self.get_crime_heads()
        minor_heads = self.get_crime_sub_heads()
        statuses = self.get_case_statuses()

        occ_rows = self.execute_query(f'SELECT "IncidentFromDate", "IncidentToDate", "InfoReceivedPSDate", "latitude", "longitude", "BriefFacts" FROM "Inv_OccuranceTime" WHERE "CaseMasterID" = {int(case_id)}')
        occ = occ_rows[0].get("Inv_OccuranceTime", {}) if occ_rows else {}

        comp_rows = self.execute_query(f'SELECT "ComplainantID", "ComplainantName", "AgeYear", "GenderID", "OccupationID", "ReligionID", "CasteID" FROM "ComplainantDetails" WHERE "CaseMasterID" = {int(case_id)}')
        occ_map = self.get_occupation_map()
        rel_map = self.get_religion_map()
        caste_map = self.get_caste_map()

        complainants_list = []
        for row in comp_rows:
            c = row.get("ComplainantDetails", {})
            complainants_list.append({
                "id": int(c.get("ComplainantID", 0)),
                "name": c.get("ComplainantName"),
                "age": c.get("AgeYear"),
                "gender": "Male" if int(c.get("GenderID", 0)) == 1 else "Female" if int(c.get("GenderID", 0)) == 2 else "Transgender",
                "occupation": occ_map.get(int(c.get("OccupationID", 0)), "N/A"),
                "religion": rel_map.get(int(c.get("ReligionID", 0)), "N/A"),
                "caste": caste_map.get(int(c.get("CasteID", 0)), "N/A")
            })

        vic_rows = self.execute_query(f'SELECT "VictimMasterID", "VictimName", "AgeYear", "GenderID", "VictimPolice" FROM "Victim" WHERE "CaseMasterID" = {int(case_id)}')
        victims_list = []
        for row in vic_rows:
            v = row.get("Victim", {})
            victims_list.append({
                "id": int(v.get("VictimMasterID", 0)),
                "name": v.get("VictimName"),
                "age": v.get("AgeYear"),
                "gender": "Male" if int(v.get("GenderID", 0)) == 1 else "Female" if int(v.get("GenderID", 0)) == 2 else "Transgender",
                "is_police": v.get("VictimPolice") == "1"
            })

        acc_rows = self.execute_query(f'SELECT "AccusedMasterID", "AccusedName", "AgeYear", "GenderID", "PersonID" FROM "Accused" WHERE "CaseMasterID" = {int(case_id)}')
        accused_list = []
        for row in acc_rows:
            a = row.get("Accused", {})
            accused_list.append({
                "id": int(a.get("AccusedMasterID", 0)),
                "person_id": a.get("PersonID"),
                "name": a.get("AccusedName"),
                "age": a.get("AgeYear"),
                "gender": "Male" if int(a.get("GenderID", 0)) == 1 else "Female" if int(a.get("GenderID", 0)) == 2 else "Transgender",
                "sort_order": a.get("PersonID")
            })

        act_rows = self.execute_query(f'SELECT "ActID", "SectionID" FROM "ActSectionAssociation" WHERE "CaseMasterID" = {int(case_id)}')
        act_sections_list = []
        for row in act_rows:
            a = row.get("ActSectionAssociation", {})
            act_sections_list.append({
                "act": a.get("ActID"),
                "section": a.get("SectionID")
            })

        cs_rows = self.execute_query(f'SELECT "CSID", "csdate", "cstype" FROM "ChargesheetDetails" WHERE "CaseMasterID" = {int(case_id)}')
        chargesheet_list = []
        for row in cs_rows:
            cs = row.get("ChargesheetDetails", {})
            chargesheet_list.append({
                "id": int(cs.get("CSID", 0)),
                "date": cs.get("csdate"),
                "type": "Chargesheet" if cs.get("cstype") == 'A' else "False Case" if cs.get("cstype") == 'B' else "Undetected"
            })

        occurrence_data = {
            "from_date": occ.get("IncidentFromDate") or "N/A",
            "to_date": occ.get("IncidentToDate") or "N/A",
            "received_date": occ.get("InfoReceivedPSDate") or "N/A",
            "latitude": float(occ.get("latitude")) if occ.get("latitude") is not None else None,
            "longitude": float(occ.get("longitude")) if occ.get("longitude") is not None else None,
            "brief_facts": occ.get("BriefFacts") or ""
        }

        return {
            "id": int(cm.get("CaseMasterID", 0)),
            "crime_no": cm.get("CrimeNo"),
            "case_no": cm.get("CaseNo"),
            "registered_date": cm.get("CrimeRegisteredDate"),
            "officer": {
                "id": int(emp.get("EmployeeID", 0)),
                "name": emp.get("FirstName"),
                "kgid": emp.get("KGID"),
                "designation": designations.get(int(emp.get("DesignationID", 0)), "N/A"),
                "rank": ranks.get(int(emp.get("RankID", 0)), "N/A")
            } if emp.get("EmployeeID") else None,
            "station": unit.get("UnitName") or "N/A",
            "category": cats.get(int(cm.get("CaseCategoryID", 0)), "N/A"),
            "gravity": gravities.get(int(cm.get("GravityOffenceID", 0)), "N/A"),
            "major_head": major_heads.get(int(cm.get("CrimeMajorHeadID", 0)), "N/A"),
            "minor_head": minor_heads.get(int(cm.get("CrimeMinorHeadID", 0)), "N/A"),
            "status": statuses.get(int(cm.get("CaseStatusID", 0)), "N/A"),
            "court": court.get("CourtName") or "N/A",
            "occurrence": occurrence_data,
            "complainants": complainants_list,
            "victims": victims_list,
            "accused": accused_list,
            "act_sections": act_sections_list,
            "chargesheets": chargesheet_list
        }

    def get_kpis(self):
        if "kpi_stats" in self._cache:
            return self._cache["kpi_stats"]

        total_rows = self.execute_query('SELECT COUNT("CaseMasterID") FROM "CaseMaster"')
        total_firs = int(total_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if total_rows else 0

        max_date_rows = self.execute_query('SELECT "CrimeRegisteredDate" FROM "CaseMaster" ORDER BY "CrimeRegisteredDate" DESC LIMIT 1')
        max_date = max_date_rows[0].get("CaseMaster", {}).get("CrimeRegisteredDate") if max_date_rows else None

        today_firs = 0
        if max_date:
            today_rows = self.execute_query(f'SELECT COUNT("CaseMasterID") FROM "CaseMaster" WHERE "CrimeRegisteredDate" = \'{max_date}\'')
            today_firs = int(today_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if today_rows else 0

        pending_rows = self.execute_query('SELECT COUNT("CaseMasterID") FROM "CaseMaster" WHERE "CaseStatusID" = 1')
        pending = int(pending_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if pending_rows else 0

        cs_rows = self.execute_query('SELECT COUNT("CaseMasterID") FROM "CaseMaster" WHERE "CaseStatusID" = 2')
        cs = int(cs_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if cs_rows else 0

        closed_rows = self.execute_query('SELECT COUNT("CaseMasterID") FROM "CaseMaster" WHERE "CaseStatusID" = 3')
        closed = int(closed_rows[0].get("CaseMaster", {}).get("ROWID", 0)) if closed_rows else 0

        vic_rows = self.execute_query('SELECT COUNT("VictimMasterID") FROM "Victim"')
        victims_count = int(vic_rows[0].get("Victim", {}).get("ROWID", 0)) if vic_rows else 0

        accused_rows = self.execute_query('SELECT "PersonID" FROM "Accused"')
        accused_unique = len(set(a.get("Accused", {}).get("PersonID") for a in accused_rows if a.get("Accused", {}).get("PersonID")))

        st_rows = self.execute_query('SELECT COUNT("UnitID") FROM "Unit" WHERE "TypeID" = 1')
        stations_count = int(st_rows[0].get("Unit", {}).get("ROWID", 0)) if st_rows else 0

        dist_rows = self.execute_query('SELECT COUNT("DistrictID") FROM "District"')
        districts_count = int(dist_rows[0].get("District", {}).get("ROWID", 0)) if dist_rows else 0

        kpi_data = {
            "total_firs": total_firs,
            "today_firs": today_firs,
            "pending_cases": pending,
            "solved_cases": cs + closed,
            "charge_sheeted": cs,
            "closed_cases": closed,
            "total_victims": victims_count,
            "total_accused": accused_unique,
            "total_stations": stations_count,
            "total_districts": districts_count
        }

        self._cache["kpi_stats"] = kpi_data
        return kpi_data

    def get_crime_trends(self):
        rows = self.execute_query('SELECT "CrimeRegisteredDate" FROM "CaseMaster"')
        dates = [r.get("CaseMaster", {}).get("CrimeRegisteredDate") for r in rows if r.get("CaseMaster", {}).get("CrimeRegisteredDate")]

        if not dates:
            return {"monthly": [], "yearly": []}

        months = []
        years = []
        for d in dates:
            try:
                dt = datetime.strptime(str(d).split(" ")[0], "%Y-%m-%d")
                months.append(dt.strftime("%Y-%m"))
                years.append(dt.strftime("%Y"))
            except Exception:
                pass

        monthly_grp = [{"month": m, "count": months.count(m)} for m in sorted(list(set(months)))]
        yearly_grp = [{"year": y, "count": years.count(y)} for y in sorted(list(set(years)))]

        return {
            "monthly": monthly_grp,
            "yearly": yearly_grp
        }

    def get_district_stats(self):
        rows = self.execute_query(
            'SELECT d."DistrictName", COUNT(c."CaseMasterID") FROM "CaseMaster" c '
            'LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" '
            'LEFT JOIN "District" d ON u."DistrictID" = d."DistrictID" '
            'GROUP BY d."DistrictName"'
        )
        res = []
        for r in rows:
            d_name = r.get("District", {}).get("DistrictName") or "N/A"
            cnt = int(r.get("CaseMaster", {}).get("ROWID", 0))
            res.append({"district": d_name, "count": cnt})
        return res

    def get_station_stats(self):
        rows = self.execute_query(
            'SELECT u."UnitName", d."DistrictName", COUNT(c."CaseMasterID") FROM "CaseMaster" c '
            'LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" '
            'LEFT JOIN "District" d ON u."DistrictID" = d."DistrictID" '
            'GROUP BY u."UnitName", d."DistrictName"'
        )
        res = []
        for r in rows:
            u_name = r.get("Unit", {}).get("UnitName") or "N/A"
            d_name = r.get("District", {}).get("DistrictName") or "N/A"
            cnt = int(r.get("CaseMaster", {}).get("ROWID", 0))
            res.append({"station": u_name, "district": d_name, "count": cnt})
        return res

    def get_category_stats(self):
        heads = self.get_crime_heads()
        subheads = self.get_crime_sub_heads()

        rows = self.execute_query('SELECT "CrimeMajorHeadID", "CrimeMinorHeadID" FROM "CaseMaster"')
        major_counts = {}
        minor_counts = {}
        for r in rows:
            cm = r.get("CaseMaster", {})
            maj_id = int(cm.get("CrimeMajorHeadID", 0))
            min_id = int(cm.get("CrimeMinorHeadID", 0))

            major_counts[maj_id] = major_counts.get(maj_id, 0) + 1
            minor_counts[min_id] = minor_counts.get(min_id, 0) + 1

        return {
            "categories": [{"name": heads.get(k, "N/A"), "count": v} for k, v in major_counts.items()],
            "subcategories": [{"name": subheads.get(k, "N/A"), "count": v} for k, v in minor_counts.items()]
        }

    def get_demographics_stats(self):
        occupations = self.get_lookup_table("OccupationMaster", "OccupationID", "OccupationName")
        religions = self.get_lookup_table("ReligionMaster", "ReligionID", "ReligionName")
        castes = self.get_lookup_table("CasteMaster", "caste_master_id", "caste_master_name")

        victim_rows = self.execute_query('SELECT "GenderID", "AgeYear" FROM "Victim"')
        accused_rows = self.execute_query('SELECT "AgeYear" FROM "Accused"')
        complainant_rows = self.execute_query('SELECT "OccupationID", "ReligionID", "CasteID" FROM "ComplainantDetails"')

        # 1. victim_gender
        vg_counts = {}
        for r in victim_rows:
            v = r.get("Victim", {})
            gid = v.get("GenderID")
            if gid is not None:
                gid = int(gid)
                vg_counts[gid] = vg_counts.get(gid, 0) + 1
        victim_gender = [{"gender_id": k, "count": v} for k, v in vg_counts.items()]

        # 2. victim_age
        va_counts = {}
        for r in victim_rows:
            v = r.get("Victim", {})
            age = v.get("AgeYear")
            if age is not None:
                age = int(age)
                bucket = f"{(age // 10) * 10}-{(age // 10) * 10 + 9}"
                va_counts[bucket] = va_counts.get(bucket, 0) + 1
        victim_age = [{"age_group": k, "count": v} for k, v in sorted(va_counts.items())]

        # 3. accused_age
        aa_counts = {}
        for r in accused_rows:
            a = r.get("Accused", {})
            age = a.get("AgeYear")
            if age is not None:
                age = int(age)
                bucket = f"{(age // 10) * 10}-{(age // 10) * 10 + 9}"
                aa_counts[bucket] = aa_counts.get(bucket, 0) + 1
        accused_age = [{"age_group": k, "count": v} for k, v in sorted(aa_counts.items())]

        # 4. complainant_occupation
        co_counts = {}
        for r in complainant_rows:
            c = r.get("ComplainantDetails", {})
            oid = c.get("OccupationID")
            if oid is not None:
                oid = int(oid)
                name = occupations.get(oid, "Unknown")
                co_counts[name] = co_counts.get(name, 0) + 1
        complainant_occupation = [{"occupation": k, "count": v} for k, v in co_counts.items()]

        # 5. complainant_religion
        cr_counts = {}
        for r in complainant_rows:
            c = r.get("ComplainantDetails", {})
            rid = c.get("ReligionID")
            if rid is not None:
                rid = int(rid)
                name = religions.get(rid, "Unknown")
                cr_counts[name] = cr_counts.get(name, 0) + 1
        complainant_religion = [{"religion": k, "count": v} for k, v in cr_counts.items()]

        # 6. complainant_caste
        cc_counts = {}
        for r in complainant_rows:
            c = r.get("ComplainantDetails", {})
            cid = c.get("CasteID")
            if cid is not None:
                cid = int(cid)
                name = castes.get(cid, "Unknown")
                cc_counts[name] = cc_counts.get(name, 0) + 1
        complainant_caste = [{"caste": k, "count": v} for k, v in cc_counts.items()]

        return {
            "victim_gender": victim_gender,
            "victim_age": victim_age,
            "accused_age": accused_age,
            "complainant_occupation": complainant_occupation,
            "complainant_religion": complainant_religion,
            "complainant_caste": complainant_caste
        }

    def get_officer_stats(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = """
                        SELECT 
                            e."EmployeeID" as id,
                            e."FirstName" as name,
                            e."KGID" as kgid,
                            u."UnitName" as unit,
                            COUNT(c."CaseMasterID") as registered,
                            SUM(CASE WHEN c."CaseStatusID" IN (2, 3) THEN 1 ELSE 0 END) as solved,
                            SUM(CASE WHEN c."CaseStatusID" = 1 THEN 1 ELSE 0 END) as pending
                        FROM "Employee" e
                        LEFT JOIN "Unit" u ON e."UnitID" = u."UnitID"
                        LEFT JOIN "CaseMaster" c ON c."PolicePersonID" = e."EmployeeID"
                        GROUP BY e."EmployeeID", e."FirstName", e."KGID", u."UnitName"
                        HAVING COUNT(c."CaseMasterID") > 0
                        ORDER BY registered DESC
                    """
                    cur.execute(query)
                    rows = cur.fetchall()

            res = []
            for r in rows:
                reg = int(r["registered"] or 0)
                sol = int(r["solved"] or 0)
                pen = int(r["pending"] or 0)
                rate = round((sol / reg) * 100) if reg > 0 else 0
                f_name = r["name"] or "Officer"
                res.append({
                    "id": r["id"],
                    "name": f_name,
                    "officer": f_name,
                    "kgid": r["kgid"] or "N/A",
                    "unit": r["unit"] or "Karnataka Police",
                    "registered": reg,
                    "count": reg,
                    "solved": sol,
                    "pending": pen,
                    "resolution_rate": rate
                })
            return res
        except Exception as e:
            logger.exception("Error in get_officer_stats:")
            return []

    def get_accused_profiles(self):
        acc_rows = self.execute_query('SELECT "PersonID", "AccusedName", "AgeYear", "GenderID", "CaseMasterID" FROM "Accused"')

        profiles = {}
        for row in acc_rows:
            a = row.get("Accused", {})
            pid = a.get("PersonID")
            if not pid:
                continue

            if pid not in profiles:
                profiles[pid] = {
                    "person_id": pid,
                    "name": a.get("AccusedName"),
                    "age": a.get("AgeYear"),
                    "gender": "Male" if int(a.get("GenderID", 0)) == 1 else "Female" if int(a.get("GenderID", 0)) == 2 else "Transgender",
                    "cases": set()
                }
            profiles[pid]["cases"].add(int(a.get("CaseMasterID", 0)))

        arr_rows = self.execute_query('SELECT "AccusedMasterID", "CaseMasterID" FROM "ArrestSurrender"')
        acc_id_map = {}
        acc_master_rows = self.execute_query('SELECT "AccusedMasterID", "PersonID" FROM "Accused"')
        for row in acc_master_rows:
            a = row.get("Accused", {})
            acc_id_map[int(a.get("AccusedMasterID", 0))] = a.get("PersonID")

        arrests_counts = {}
        for row in arr_rows:
            arr = row.get("ArrestSurrender", {})
            amid = int(arr.get("AccusedMasterID", 0))
            pid = acc_id_map.get(amid)
            if pid:
                arrests_counts[pid] = arrests_counts.get(pid, 0) + 1

        result = []
        for pid, p in profiles.items():
            firs_count = len(p["cases"])
            arr_count = arrests_counts.get(pid, 0)
            repeat_score = min(100, firs_count * 15 + arr_count * 10 + 10)

            result.append({
                "person_id": pid,
                "name": p["name"],
                "age": p["age"],
                "gender": p["gender"],
                "firs_count": firs_count,
                "arrests_count": arr_count,
                "repeat_score": repeat_score
            })

        return sorted(result, key=lambda x: x["repeat_score"], reverse=True)

    def get_accused_details(self, person_id: str):
        escaped_pid = str(person_id).replace("'", "''")
        acc_rows = self.execute_query(f'SELECT "AccusedMasterID", "AccusedName", "AgeYear", "GenderID", "CaseMasterID" FROM "Accused" WHERE "PersonID" = \'{escaped_pid}\'')
        if not acc_rows:
            return None

        name = acc_rows[0].get("Accused", {}).get("AccusedName")
        age = acc_rows[0].get("Accused", {}).get("AgeYear")
        gender = "Male" if int(acc_rows[0].get("Accused", {}).get("GenderID", 0)) == 1 else "Female" if int(acc_rows[0].get("Accused", {}).get("GenderID", 0)) == 2 else "Transgender"

        case_ids = [int(a.get("Accused", {}).get("CaseMasterID", 0)) for a in acc_rows]
        id_list_str = ", ".join(str(cid) for cid in case_ids)

        major_heads = self.get_crime_heads()
        statuses = self.get_case_statuses()

        cases = []
        if case_ids:
            case_rows = self.execute_query(
                f'SELECT c."CaseMasterID", c."CrimeNo", c."CaseNo", c."CrimeRegisteredDate", '
                f'c."CrimeMajorHeadID", c."CaseStatusID", u."UnitName", ot."BriefFacts" '
                f'FROM "CaseMaster" c '
                f'LEFT JOIN "Unit" u ON c."PoliceStationID" = u."UnitID" '
                f'LEFT JOIN "Inv_OccuranceTime" ot ON c."CaseMasterID" = ot."CaseMasterID" '
                f'WHERE c."CaseMasterID" IN ({id_list_str})'
            )
            for row in case_rows:
                cm = row.get("CaseMaster", {})
                u = row.get("Unit", {})
                occ = row.get("Inv_OccuranceTime", {})
                cases.append({
                    "id": int(cm.get("CaseMasterID", 0)),
                    "crime_no": cm.get("CrimeNo"),
                    "case_no": cm.get("CaseNo"),
                    "registered_date": cm.get("CrimeRegisteredDate"),
                    "major_head": major_heads.get(int(cm.get("CrimeMajorHeadID", 0)), "N/A"),
                    "status": statuses.get(int(cm.get("CaseStatusID", 0)), "N/A"),
                    "station": u.get("UnitName") or "N/A",
                    "brief_facts": occ.get("BriefFacts") or ""
                })

        arrest_rows = []
        acc_master_ids = [int(a.get("Accused", {}).get("AccusedMasterID", 0)) for a in acc_rows]
        master_ids_str = ", ".join(str(mid) for mid in acc_master_ids)
        if acc_master_ids:
            arr_data = self.execute_query(
                f'SELECT a."ArrestSurrenderID", a."ArrestSurrenderDate", '
                f'u."UnitName", d."DistrictName" '
                f'FROM "ArrestSurrender" a '
                f'LEFT JOIN "Unit" u ON a."PoliceStationID" = u."UnitID" '
                f'LEFT JOIN "District" d ON a."ArrestSurrenderDistrictId" = d."DistrictID" '
                f'WHERE a."AccusedMasterID" IN ({master_ids_str})'
            )
            for row in arr_data:
                arr = row.get("ArrestSurrender", {})
                u = row.get("Unit", {})
                d = row.get("District", {})
                arrest_rows.append({
                    "id": int(arr.get("ArrestSurrenderID", 0)),
                    "date": arr.get("ArrestSurrenderDate"),
                    "station": u.get("UnitName") or "N/A",
                    "district": d.get("DistrictName") or "N/A"
                })

        return {
            "person_id": person_id,
            "name": name,
            "age": age,
            "gender": gender,
            "cases": cases,
            "arrests": arrest_rows
        }

    def get_victim_profiles(self):
        rows = self.execute_query('SELECT "VictimName", "AgeYear", "GenderID", "VictimPolice" FROM "Victim"')
        genders = {1: "Male", 2: "Female", 3: "Transgender"}

        profiles = []
        for r in rows:
            v = r.get("Victim", {})
            profiles.append({
                "name": v.get("VictimName"),
                "age": v.get("AgeYear"),
                "gender": genders.get(int(v.get("GenderID") or 0), "N/A"),
                "is_police": v.get("VictimPolice") == "1"
            })
        return profiles

    def save_chat_log(self, user_query: str, bot_response: str):
        logger.info(f"Chat log recorded: query='{user_query[:50]}...'")

    def save_system_log(self, event_name: str, details: str):
        logger.info(f"System log recorded: event='{event_name}' details='{details[:100]}'")

    def get_crime_summary(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            COUNT(*) as total_cases,
                            MIN("CrimeRegisteredDate") as earliest_date,
                            MAX("CrimeRegisteredDate") as latest_date,
                            SUM(CASE WHEN "CaseStatusID" = 1 THEN 1 ELSE 0 END) as under_investigation,
                            SUM(CASE WHEN "CaseStatusID" = 2 THEN 1 ELSE 0 END) as charge_sheeted,
                            SUM(CASE WHEN "CaseStatusID" = 3 THEN 1 ELSE 0 END) as closed
                        FROM "CaseMaster"
                    """)
                    row = cur.fetchone()

                    cur.execute('SELECT COUNT(DISTINCT "DistrictID") as cnt FROM "District"')
                    total_districts = cur.fetchone()["cnt"]

                    cur.execute('SELECT COUNT(DISTINCT "UnitID") as cnt FROM "Unit"')
                    total_stations = cur.fetchone()["cnt"]

                    cur.execute('SELECT COUNT(DISTINCT "PersonID") as cnt FROM "Accused" WHERE "PersonID" IS NOT NULL')
                    total_accused = cur.fetchone()["cnt"]

                    cur.execute('SELECT COUNT(*) as cnt FROM "Victim"')
                    total_victims = cur.fetchone()["cnt"]

            return {
                "total_cases": int(row["total_cases"] or 0),
                "earliest_date": str(row["earliest_date"] or "N/A"),
                "latest_date": str(row["latest_date"] or "N/A"),
                "under_investigation": int(row["under_investigation"] or 0),
                "charge_sheeted": int(row["charge_sheeted"] or 0),
                "closed": int(row["closed"] or 0),
                "total_districts": int(total_districts or 0),
                "total_stations": int(total_stations or 0),
                "total_accused": int(total_accused or 0),
                "total_victims": int(total_victims or 0)
            }
        except Exception as e:
            logger.exception("Error in get_crime_summary:")
            return {"total_cases": 0, "under_investigation": 0, "charge_sheeted": 0, "closed": 0}

    def get_crime_by_category(self, category_name=None):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if category_name:
                        query = """
                            SELECT 
                                ch."CrimeGroupName" as category,
                                csh."CrimeHeadName" as subcategory,
                                COUNT(c."CaseMasterID") as case_count
                            FROM "CaseMaster" c
                            JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                            JOIN "CrimeSubHead" csh ON c."CrimeMinorHeadID" = csh."CrimeSubHeadID"
                            WHERE LOWER(ch."CrimeGroupName") LIKE %s OR LOWER(csh."CrimeHeadName") LIKE %s
                            GROUP BY ch."CrimeGroupName", csh."CrimeHeadName"
                            ORDER BY case_count DESC
                        """
                        pattern = f"%{category_name.lower().strip()}%"
                        cur.execute(query, (pattern, pattern))
                        rows = cur.fetchall()
                    else:
                        query = """
                            SELECT 
                                ch."CrimeGroupName" as category,
                                COUNT(c."CaseMasterID") as case_count,
                                ROUND(COUNT(c."CaseMasterID") * 100.0 / (SELECT COUNT(*) FROM "CaseMaster"), 1) as percentage
                            FROM "CaseMaster" c
                            JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                            GROUP BY ch."CrimeHeadID", ch."CrimeGroupName"
                            ORDER BY case_count DESC
                        """
                        cur.execute(query)
                        rows = cur.fetchall()

            res = []
            for r in rows:
                d = dict(r)
                if "percentage" in d and isinstance(d["percentage"], Decimal):
                    d["percentage"] = float(d["percentage"])
                res.append(d)
            return res
        except Exception as e:
            logger.exception("Error in get_crime_by_category:")
            return []

    def get_crime_by_location(self, district_name=None):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    districts_query = """
                        SELECT 
                            d."DistrictName" as district,
                            COUNT(c."CaseMasterID") as case_count,
                            SUM(CASE WHEN c."CaseStatusID" IN (2, 3) THEN 1 ELSE 0 END) as solved_count,
                            SUM(CASE WHEN c."CaseStatusID" = 1 THEN 1 ELSE 0 END) as pending_count
                        FROM "CaseMaster" c
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        GROUP BY d."DistrictID", d."DistrictName"
                        ORDER BY case_count DESC
                    """
                    cur.execute(districts_query)
                    districts = [dict(r) for r in cur.fetchall()]

                    top_stations_query = """
                        SELECT 
                            u."UnitName" as station,
                            d."DistrictName" as district,
                            COUNT(c."CaseMasterID") as case_count
                        FROM "CaseMaster" c
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        GROUP BY u."UnitName", d."DistrictName"
                        ORDER BY case_count DESC
                        LIMIT 8
                    """
                    cur.execute(top_stations_query)
                    top_stations = [dict(r) for r in cur.fetchall()]

            return {
                "districts": districts,
                "top_stations": top_stations
            }
        except Exception as e:
            logger.exception("Error in get_crime_by_location:")
            return {"districts": [], "top_stations": []}

    def get_crime_trends_data(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    monthly_query = """
                        SELECT 
                            TO_CHAR("CrimeRegisteredDate", 'YYYY-MM') as month,
                            COUNT("CaseMasterID") as count
                        FROM "CaseMaster"
                        WHERE "CrimeRegisteredDate" IS NOT NULL
                        GROUP BY TO_CHAR("CrimeRegisteredDate", 'YYYY-MM')
                        ORDER BY month ASC
                    """
                    cur.execute(monthly_query)
                    monthly = [dict(r) for r in cur.fetchall()]

                    yearly_query = """
                        SELECT 
                            TO_CHAR("CrimeRegisteredDate", 'YYYY') as year,
                            COUNT("CaseMasterID") as count
                        FROM "CaseMaster"
                        WHERE "CrimeRegisteredDate" IS NOT NULL
                        GROUP BY TO_CHAR("CrimeRegisteredDate", 'YYYY')
                        ORDER BY year ASC
                    """
                    cur.execute(yearly_query)
                    yearly = [dict(r) for r in cur.fetchall()]

            return {
                "monthly": monthly,
                "yearly": yearly
            }
        except Exception as e:
            logger.exception("Error in get_crime_trends_data:")
            return {"monthly": [], "yearly": []}

    def get_recent_crimes(self, limit=6):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = """
                        SELECT 
                            c."CrimeNo" as crime_no,
                            c."CaseNo" as case_no,
                            c."CrimeRegisteredDate" as registered_date,
                            ch."CrimeGroupName" as major_category,
                            csh."CrimeHeadName" as sub_category,
                            u."UnitName" as station_name,
                            d."DistrictName" as district_name,
                            cs."CaseStatusName" as status,
                            ot."BriefFacts" as brief_facts
                        FROM "CaseMaster" c
                        JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                        JOIN "CrimeSubHead" csh ON c."CrimeMinorHeadID" = csh."CrimeSubHeadID"
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        JOIN "CaseStatusMaster" cs ON c."CaseStatusID" = cs."CaseStatusID"
                        LEFT JOIN "Inv_OccuranceTime" ot ON c."CaseMasterID" = ot."CaseMasterID"
                        ORDER BY c."CrimeRegisteredDate" DESC
                        LIMIT %s
                    """
                    cur.execute(query, (int(limit),))
                    rows = cur.fetchall()

            res = []
            for r in rows:
                d = dict(r)
                if isinstance(d.get("registered_date"), (date, datetime)):
                    d["registered_date"] = d["registered_date"].isoformat()
                res.append(d)
            return res
        except Exception as e:
            logger.exception("Error in get_recent_crimes:")
            return []

    def get_structured_intelligence_context(self, user_query: str):
        """
        Retrieves real crime database facts matching the user's query context.
        Returns context string, record count, and facets.
        """
        q = (user_query or "").lower().strip()
        facets = []
        data_blocks = []

        summary = self.get_crime_summary()
        records_analyzed = summary.get("total_cases", 120)

        # Baseline platform overview
        data_blocks.append(
            f"=== DATABASE OVERVIEW ===\n"
            f"- Total Case Records: {summary['total_cases']}\n"
            f"- Date Range: {summary['earliest_date']} to {summary['latest_date']}\n"
            f"- Status Breakdown: {summary['under_investigation']} Under Investigation, "
            f"{summary['charge_sheeted']} Charge Sheeted, {summary['closed']} Closed\n"
            f"- Total Tracked Accused: {summary['total_accused']}, Total Victims: {summary['total_victims']}\n"
            f"- Jurisdictions: {summary['total_districts']} Districts, {summary['total_stations']} Police Stations"
        )
        facets.append("General Summary")

        # Category queries
        if any(w in q for w in ["category", "categories", "most common", "type", "kind", "crimes", "breakdown", "distribution"]):
            cat_data = self.get_crime_by_category()
            cat_lines = [f"  • {c['category']}: {c['case_count']} cases ({c['percentage']}%)" for c in cat_data]
            data_blocks.append("=== CRIME CATEGORIES (RANKED) ===\n" + "\n".join(cat_lines))
            facets.append("Category Distribution")

        # Location / District queries
        if any(w in q for w in ["location", "district", "station", "area", "city", "where", "highest", "place", "bengaluru", "mysuru", "mangaluru", "belagavi"]):
            loc_data = self.get_crime_by_location()
            dist_lines = [f"  • {d['district']}: {d['case_count']} cases (Solved: {d['solved_count']}, Pending: {d['pending_count']})" for d in loc_data["districts"]]
            stn_lines = [f"  • {s['station']} ({s['district']}): {s['case_count']} cases" for s in loc_data["top_stations"]]
            data_blocks.append("=== DISTRICT VOLUME BREAKDOWN ===\n" + "\n".join(dist_lines))
            data_blocks.append("=== TOP POLICE STATIONS BY VOLUME ===\n" + "\n".join(stn_lines))
            facets.append("Location Analysis")

        # Trends / Forecast queries
        if any(w in q for w in ["trend", "trends", "month", "year", "increase", "decrease", "forecast", "pattern", "time"]):
            trends_data = self.get_crime_trends_data()
            recent_months = trends_data["monthly"][-6:] if trends_data["monthly"] else []
            month_lines = [f"  • {m['month']}: {m['count']} cases" for m in recent_months]
            year_lines = [f"  • Year {y['year']}: {y['count']} cases" for y in trends_data["yearly"]]
            data_blocks.append("=== RECENT MONTHLY CRIME TRENDS ===\n" + "\n".join(month_lines))
            data_blocks.append("=== YEARLY CRIME TOTALS ===\n" + "\n".join(year_lines))
            facets.append("Crime Trends")

        # Recent crimes queries
        if any(w in q for w in ["recent", "latest", "new", "last", "current", "cases", "fir"]):
            recent_cases = self.get_recent_crimes(limit=6)
            case_lines = []
            for rc in recent_cases:
                facts = (rc.get('brief_facts') or 'No facts registered').replace('\n', ' ')
                if len(facts) > 120:
                    facts = facts[:120] + "..."
                case_lines.append(
                    f"  • FIR {rc['crime_no']} ({rc['registered_date']}): {rc['major_category']} - {rc['sub_category']} "
                    f"at {rc['station_name']} ({rc['district_name']}) | Status: {rc['status']} | Facts: {facts}"
                )
            data_blocks.append("=== MOST RECENT REGISTERED CASES ===\n" + "\n".join(case_lines))
            facets.append("Recent Cases")

        # Suspects / Repeat offenders
        if any(w in q for w in ["suspect", "repeat", "offender", "accused", "gang", "criminal"]):
            accused_data = self.get_accused_profiles()[:5]
            acc_lines = [
                f"  • Accused ID {a['person_id']}: {a['firs_count']} linked cases, {a['arrests_count']} arrests, repeat risk score: {a['repeat_score']}/100"
                for a in accused_data
            ]
            data_blocks.append("=== HIGH-FREQUENCY OFFENDER SUMMARY (DATA RECORDS) ===\n" + "\n".join(acc_lines))
            facets.append("Accused Records")

        # Fallback baseline context
        if len(facets) == 1:
            cat_data = self.get_crime_by_category()
            cat_lines = [f"  • {c['category']}: {c['case_count']} cases ({c['percentage']}%)" for c in cat_data[:4]]
            data_blocks.append("=== KEY CRIME CATEGORIES ===\n" + "\n".join(cat_lines))

            loc_data = self.get_crime_by_location()
            dist_lines = [f"  • {d['district']}: {d['case_count']} cases" for d in loc_data["districts"][:4]]
            data_blocks.append("=== TOP DISTRICTS ===\n" + "\n".join(dist_lines))
            facets.extend(["Top Categories", "Top Districts"])

        return {
            "context_text": "\n\n".join(data_blocks),
            "records_analyzed": records_analyzed,
            "facets": facets
        }

    def get_hotspots_statistical_data(self, category_id=None):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = """
                        SELECT 
                            u."UnitID",
                            u."UnitName",
                            d."DistrictName",
                            COUNT(c."CaseMasterID") as incident_count,
                            SUM(CASE WHEN c."CrimeRegisteredDate" >= '2025-06-01' THEN 1 ELSE 0 END) as recent_incidents,
                            SUM(CASE WHEN c."GravityOffenceID" = 1 THEN 1 ELSE 0 END) as heinous_count,
                            AVG(ot.latitude) as avg_lat,
                            AVG(ot.longitude) as avg_lng
                        FROM "CaseMaster" c
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        LEFT JOIN "Inv_OccuranceTime" ot ON c."CaseMasterID" = ot."CaseMasterID"
                    """
                    params = []
                    if category_id:
                        query += ' WHERE c."CrimeMajorHeadID" = %s'
                        params.append(category_id)
                    query += ' GROUP BY u."UnitID", u."UnitName", d."DistrictName" ORDER BY incident_count DESC'

                    cur.execute(query, params)
                    stations = [dict(r) for r in cur.fetchall()]

                    top_query = """
                        SELECT c."PoliceStationID", ch."CrimeGroupName", COUNT(*) as cnt
                        FROM "CaseMaster" c
                        JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                    """
                    if category_id:
                        top_query += ' WHERE c."CrimeMajorHeadID" = %s'
                    top_query += ' GROUP BY c."PoliceStationID", ch."CrimeHeadID", ch."CrimeGroupName" ORDER BY c."PoliceStationID", cnt DESC'

                    cur.execute(top_query, params)
                    top_crimes = {}
                    for r in cur.fetchall():
                        pid = r["PoliceStationID"]
                        if pid not in top_crimes:
                            top_crimes[pid] = r["CrimeGroupName"]

            max_incidents = max([s["incident_count"] for s in stations]) if stations else 1

            hotspots = []
            for idx, s in enumerate(stations, 1):
                total = s["incident_count"]
                recent = s["recent_incidents"] or 0
                heinous = s["heinous_count"] or 0
                lat = float(s["avg_lat"]) if s["avg_lat"] is not None else None
                lng = float(s["avg_lng"]) if s["avg_lng"] is not None else None

                vol_pts = min(45, (total / float(max_incidents)) * 45)
                heinous_pts = (heinous / float(max(1, total))) * 35
                recent_pts = (recent / float(max(1, total))) * 20
                risk_score = min(100, int(round(vol_pts + heinous_pts + recent_pts)))

                if recent >= (total - recent) * 0.7 and recent >= 2:
                    trend = "increasing"
                elif recent <= 1 and total >= 4:
                    trend = "decreasing"
                else:
                    trend = "stable"

                top_c = top_crimes.get(s["UnitID"], "General Offences")

                hotspots.append({
                    "rank": idx,
                    "location": s["UnitName"],
                    "district": s["DistrictName"],
                    "risk_score": risk_score,
                    "incident_count": total,
                    "recent_incidents": recent,
                    "heinous_count": heinous,
                    "trend": trend,
                    "top_crime": top_c,
                    "latitude": round(lat, 4) if lat is not None else None,
                    "longitude": round(lng, 4) if lng is not None else None,
                    "lat": lat if lat is not None else 12.9716,
                    "lng": lng if lng is not None else 77.5946,
                    "reason": f"High risk cluster at {s['UnitName']} ({s['DistrictName']}) with {total} total incidents ({heinous} heinous)."
                })

            hotspots = sorted(hotspots, key=lambda x: x["risk_score"], reverse=True)
            for idx, h in enumerate(hotspots, 1):
                h["rank"] = idx

            return hotspots
        except Exception as e:
            logger.exception("Error in get_hotspots_statistical_data:")
            return []

    def get_trend_statistical_data(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT TO_CHAR("CrimeRegisteredDate", 'YYYY-MM') as ym, COUNT(*) as cnt
                        FROM "CaseMaster"
                        GROUP BY ym
                        ORDER BY ym
                    """)
                    monthly_rows = [dict(r) for r in cur.fetchall()]

                    if len(monthly_rows) < 3:
                        return {
                            "status": "insufficient_data",
                            "message": "Not enough historical records to generate a reliable forecast."
                        }

                    counts = [r["cnt"] for r in monthly_rows]
                    n = len(counts)
                    x = list(range(n))

                    mean_x = sum(x) / n
                    mean_y = sum(counts) / n
                    num = sum((x[i] - mean_x) * (counts[i] - mean_y) for i in range(n))
                    den = sum((x[i] - mean_x) ** 2 for i in range(n))
                    slope = num / den if den != 0 else 0
                    intercept = mean_y - slope * mean_x

                    residuals_sq = sum((counts[i] - (slope * x[i] + intercept)) ** 2 for i in range(n))
                    std_err = math.sqrt(residuals_sq / (n - 2)) if n > 2 else 2.0

                    recent_6m = sum(counts[-6:])
                    prior_6m = sum(counts[-12:-6]) if n >= 12 else sum(counts[:max(1, n-6)])
                    pct_change = round(((recent_6m - prior_6m) / max(1, prior_6m)) * 100, 1)

                    if pct_change > 5:
                        overall_trend = "increasing"
                    elif pct_change < -5:
                        overall_trend = "decreasing"
                    else:
                        overall_trend = "stable"

                    cur.execute("""
                        SELECT 
                            ch."CrimeGroupName",
                            SUM(CASE WHEN c."CrimeRegisteredDate" >= '2025-06-01' THEN 1 ELSE 0 END) as recent_c,
                            SUM(CASE WHEN c."CrimeRegisteredDate" < '2025-06-01' AND c."CrimeRegisteredDate" >= '2024-05-01' THEN 1 ELSE 0 END) as prior_c
                        FROM "CaseMaster" c
                        JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                        GROUP BY ch."CrimeHeadID", ch."CrimeGroupName"
                        ORDER BY recent_c DESC
                    """)
                    cat_rows = [dict(r) for r in cur.fetchall()]

            categories = []
            for cr in cat_rows:
                rec = cr["recent_c"] or 0
                pri = cr["prior_c"] or 0
                chg = round(((rec - pri) / max(1, pri)) * 100, 1)
                tr = "increasing" if chg > 5 else ("decreasing" if chg < -5 else "stable")
                categories.append({
                    "category": cr["CrimeGroupName"],
                    "trend": tr,
                    "change_percentage": chg,
                    "recent_count": rec,
                    "prior_count": pri
                })

            last_ym_str = monthly_rows[-1]["ym"]
            last_dt = datetime.strptime(last_ym_str, "%Y-%m")

            historical_chart = [{"month": r["ym"], "actual": r["cnt"]} for r in monthly_rows]

            forecast_chart = []
            for i in range(1, 7):
                fut_dt = last_dt + timedelta(days=31 * i)
                fut_x = len(x) + i - 1
                pred_val = max(1, int(round(slope * fut_x + intercept)))
                forecast_chart.append({
                    "month": fut_dt.strftime("%Y-%m"),
                    "predicted": pred_val,
                    "lower_bound": max(0, int(round(pred_val - 1.96 * std_err))),
                    "upper_bound": int(round(pred_val + 1.96 * std_err))
                })

            return {
                "overall_trend": overall_trend,
                "trend_percentage": pct_change,
                "forecast_period": "Next 7 Days / 6-Month Horizon",
                "categories": categories,
                "historical_chart": historical_chart,
                "forecast_chart": forecast_chart,
                "monthly_counts": monthly_rows
            }
        except Exception as e:
            logger.exception("Error in get_trend_statistical_data:")
            return {"status": "error", "message": str(e)}

    def get_anomalies_statistical_data(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            u."UnitName",
                            d."DistrictName",
                            TO_CHAR(c."CrimeRegisteredDate", 'YYYY-MM') as ym,
                            ch."CrimeGroupName",
                            COUNT(c."CaseMasterID") as observed_count
                        FROM "CaseMaster" c
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        JOIN "CrimeHead" ch ON c."CrimeMajorHeadID" = ch."CrimeHeadID"
                        GROUP BY u."UnitID", u."UnitName", d."DistrictName", ym, ch."CrimeHeadID", ch."CrimeGroupName"
                        ORDER BY observed_count DESC
                    """)
                    rows = [dict(r) for r in cur.fetchall()]

                    if not rows:
                        return []

                    mean_baseline = 0.35
                    std_dev = 0.55

                    anomalies = []
                    for r in rows:
                        obs = r["observed_count"]
                        if obs >= 2:
                            z_score = round(float((obs - mean_baseline) / std_dev), 2)
                            if z_score >= 3.0:
                                severity = "CRITICAL"
                            elif z_score >= 2.0:
                                severity = "HIGH"
                            elif z_score >= 1.5:
                                severity = "MEDIUM"
                            else:
                                severity = "LOW"

                            anomalies.append({
                                "location": f"{r['UnitName']} ({r['DistrictName']})",
                                "date": r["ym"],
                                "observed_count": obs,
                                "expected_count": round(mean_baseline, 1),
                                "anomaly_score": z_score,
                                "severity": severity,
                                "crime_category": r["CrimeGroupName"]
                            })

                    cur.execute("""
                        SELECT 
                            d."DistrictName",
                            TO_CHAR(c."CrimeRegisteredDate", 'YYYY-MM') as ym,
                            COUNT(c."CaseMasterID") as observed_count
                        FROM "CaseMaster" c
                        JOIN "Unit" u ON c."PoliceStationID" = u."UnitID"
                        JOIN "District" d ON u."DistrictID" = d."DistrictID"
                        GROUP BY d."DistrictID", d."DistrictName", ym
                        HAVING COUNT(c."CaseMasterID") >= 3
                        ORDER BY observed_count DESC
                    """)
                    for dr in cur.fetchall():
                        d_obs = dr["observed_count"]
                        d_mean = 0.8
                        d_z = round(float((d_obs - d_mean) / 0.9), 2)
                        if d_z >= 2.0:
                            anomalies.append({
                                "location": f"{dr['DistrictName']} District",
                                "date": dr["ym"],
                                "observed_count": d_obs,
                                "expected_count": d_mean,
                                "anomaly_score": d_z,
                                "severity": "CRITICAL" if d_z >= 3.0 else "HIGH",
                                "crime_category": "Multiple Concurrent Head Violations"
                            })

            return sorted(anomalies, key=lambda x: x["anomaly_score"], reverse=True)
        except Exception as e:
            logger.exception("Error in get_anomalies_statistical_data:")
            return []

    def close(self):
        if self._pool:
            try:
                self._pool.closeall()
            except Exception:
                pass

if __name__ == "__main__":
    print("=" * 65)
    print("Karnataka Police Crime Intelligence Platform - Database Verification")
    print("=" * 65)

    db = DatabaseHelper()

    print("\n[+] Inspecting PostgreSQL Schema...")
    with db.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = [r[0] for r in cur.fetchall()]
            print(f"    Tables found ({len(tables)}): {', '.join(tables[:8])}...")

            print("\n[+] Querying PostgreSQL Record Counts...")
            cur.execute('SELECT COUNT(*) FROM "CaseMaster";')
            print(f"    - Total CaseMaster records:      {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "Accused";')
            print(f"    - Total Accused records:         {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "Victim";')
            print(f"    - Total Victim records:          {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "ComplainantDetails";')
            print(f"    - Total Complainant records:     {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "Employee";')
            print(f"    - Total Employee records:        {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "ActSectionAssociation";')
            print(f"    - Total ActSection records:      {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "ArrestSurrender";')
            print(f"    - Total ArrestSurrender records: {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "ChargesheetDetails";')
            print(f"    - Total Chargesheet records:     {cur.fetchone()[0]}")

            cur.execute('SELECT COUNT(*) FROM "Inv_OccuranceTime";')
            print(f"    - Total Inv_OccuranceTime records: {cur.fetchone()[0]}")

            total_rows = 0
            for t in tables:
                cur.execute(f'SELECT COUNT(*) FROM "{t}";')
                total_rows += cur.fetchone()[0]
            print(f"\n    - Total rows across all {len(tables)} tables: {total_rows}")

    print("\n[OK] PostgreSQL DatabaseHelper verification successful!")
    print("=" * 65)
