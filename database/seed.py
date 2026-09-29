import os
import random
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import (
    Base, State, District, UnitType, Unit, Rank, Designation, Employee, Court,
    CaseCategory, GravityOffence, CrimeHead, CrimeSubHead, CaseStatusMaster,
    CasteMaster, ReligionMaster, OccupationMaster, CaseMaster, Inv_OccuranceTime,
    ComplainantDetails, Act, Section, ActSectionAssociation, Victim, Accused,
    ArrestSurrender, inv_arrestsurrenderaccused, CrimeHeadActSection, ChargesheetDetails
)
from app.db.connection import engine, SessionLocal

# Sample Names for seeding
MALE_NAMES = ["Ramesh", "Suresh", "Ganesh", "Mahesh", "Manjunath", "Anil", "Basavaraj", "Nikhil", "Praveen", "Kiran", "Vijay", "Rajesh", "Sandeep", "Santosh", "Raghu", "Shivakumar", "Harish", "Pradeep", "Arjun", "Vikram"]
FEMALE_NAMES = ["Anjali", "Sunitha", "Geetha", "Kavitha", "Lakshmi", "Shruthi", "Priyanka", "Deepa", "Divya", "Ramya", "Shilpa", "Radha", "Vidya", "Meena", "Roopa", "Kavya", "Asha", "Rekha", "Sujatha", "Rashmi"]
LAST_NAMES = ["Gowda", "Patil", "Shetty", "Nayak", "Kulkarni", "Bhat", "Joshi", "Hegde", "Rao", "Reddy", "Madar", "Kuruba", "Banakar", "Desai", "Mathad", "Hiremath", "Pujar", "Siddaramaiah", "Prasad", "Naidu"]

STATION_NAMES = {
    "Bengaluru City": ["Koramangala PS", "Jayanagar PS", "Indiranagar PS", "Whitefield PS", "Cubbon Park PS", "Majestic PS"],
    "Mysuru": ["Lashkar PS", "Devaraja PS", "Vidyaranyapuram PS", "K R PS", "Nazarbad PS"],
    "Hubballi-Dharwad": ["Suburban PS", "Town PS", "Gokul Road PS", "Vidyanagar PS"],
    "Mangaluru": ["Pandeshwar PS", "Kadri PS", "Urwa PS", "Bunder PS"],
    "Belagavi": ["Khade Bazar PS", "Camp PS", "APMC PS", "Shahapur PS"],
    "Kalaburagi": ["Chowk PS", "Raghavendra Nagar PS", "Station Bazar PS"],
    "Shimoga": ["Doddapet PS", "Kote PS", "Tunga Nagar PS"]
}

DISTRICT_COORDINATES = {
    "Bengaluru City": (12.9716, 77.5946),
    "Mysuru": (12.2958, 76.6394),
    "Hubballi-Dharwad": (15.3647, 75.1240),
    "Mangaluru": (12.9141, 74.8560),
    "Belagavi": (15.8497, 74.4977),
    "Kalaburagi": (17.3297, 76.8343),
    "Shimoga": (13.9299, 75.5681)
}

BRIEF_FACTS_TEMPLATES = {
    "Murder": "The complainant stated that on {date} at around {time}, the accused persons {accused} attacked the victim {victim} with lethal weapons due to {motive}. The victim sustained grievous head injuries and died on the spot. Investigating team rushed to the scene, conducted inquest and sent the body for autopsy.",
    "Theft": "The complainant reported that when they returned home on {date} after a family trip, they found the lock of the main door broken. On checking, gold jewelry weighing approximately 50 grams and cash amounting to INR 45,000 were found missing from the cupboard. Suspicion on unknown miscreants.",
    "Burglary": "An incident of burglary occurred at a commercial electronic shop in the middle of the night. The accused gained entry by drilling a hole in the rear wall of the building. Laptops, smartphones, and cash box contents valued at INR 3.5 Lakhs were stolen. Surveillance cameras captured footage of two suspects.",
    "Online Fraud": "The victim received a phone call from an unknown person claiming to be a bank official. Under the pretext of updating KYC details, the caller obtained the victim's bank account details and OTP. Subsequently, INR 1,20,000 was unauthorizedly debited from the victim's account in multiple transactions.",
    "Drug Trafficking": "Based on credible intelligence, the police team conducted a raid near a local college campus. The accused {accused} was apprehended while trying to sell suspected narcotic substances. Upon search, 2.5 kg of Ganja was recovered from his possession along with weighing scales and packing materials.",
    "Robbery": "The complainant was returning home on a two-wheeler at night. Two unidentified individuals on a motorcycle blocked their path, threatened them with a knife, and forcefully snatched a gold chain and mobile phone before fleeing the spot."
}

MOTIVES = ["previous enmity", "property dispute", "financial altercations", "sudden provocation", "jealousy", "business rivalry"]

def generate_crime_no(category_id, district_id, unit_id, year, serial):
    # Crime Number format:
    # 1 digit Case Category Code + 4 digit District ID + 4 digit Police Station ID (Unit ID) + 4 digit Year + 5 digit Running Serial Number
    return f"{category_id}{district_id:04d}{unit_id:04d}{year}{serial:05d}"

def generate_case_no(year, serial):
    # Case Number format: YYYY + 5-digit running serial number (e.g., 202600001)
    return f"{year}{serial:05d}"

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()

    try:
        # 1. State
        karnataka = State(StateID=1, StateName="Karnataka", NationalityID=1, Active=True)
        session.add(karnataka)
        session.flush()

        # 2. Districts
        districts = []
        district_names = list(STATION_NAMES.keys())
        for idx, dname in enumerate(district_names, start=1):
            d = District(DistrictID=idx, DistrictName=dname, StateID=karnataka.StateID, Active=True)
            districts.append(d)
            session.add(d)
        session.flush()

        # 3. Unit Types
        ut_ps = UnitType(UnitTypeID=1, UnitTypeName="Police Station", CityDistState="District", Hierarchy=3, Active=True)
        ut_co = UnitType(UnitTypeID=2, UnitTypeName="Circle Office", CityDistState="District", Hierarchy=2, Active=True)
        session.add_all([ut_ps, ut_co])
        session.flush()

        # 4. Units (Police Stations and Circle Offices)
        units = []
        unit_id_counter = 1
        ps_units = []
        for dist in districts:
            # Circle Office first
            co = Unit(
                UnitID=unit_id_counter,
                UnitName=f"{dist.DistrictName} Circle Office",
                TypeID=ut_co.UnitTypeID,
                ParentUnit=None,
                NationalityID=1,
                StateID=karnataka.StateID,
                DistrictID=dist.DistrictID,
                Active=True
            )
            session.add(co)
            unit_id_counter += 1
            
            # Stations
            stations = STATION_NAMES[dist.DistrictName]
            for st_name in stations:
                ps = Unit(
                    UnitID=unit_id_counter,
                    UnitName=st_name,
                    TypeID=ut_ps.UnitTypeID,
                    ParentUnit=co.UnitID,
                    NationalityID=1,
                    StateID=karnataka.StateID,
                    DistrictID=dist.DistrictID,
                    Active=True
                )
                units.append(ps)
                ps_units.append(ps)
                session.add(ps)
                unit_id_counter += 1
        session.flush()

        # 5. Ranks
        ranks_data = [
            (1, "Constable", 7),
            (2, "Head Constable", 6),
            (3, "Assistant Sub-Inspector", 5),
            (4, "Sub-Inspector", 4),
            (5, "Inspector", 3),
            (6, "Deputy Superintendent of Police", 2),
            (7, "Superintendent of Police", 1)
        ]
        ranks = []
        for rid, rname, h in ranks_data:
            r = Rank(RankID=rid, RankName=rname, Hierarchy=h, Active=True)
            ranks.append(r)
            session.add(r)
        session.flush()

        # 6. Designations
        designations_data = [
            (1, "Station House Officer", 1),
            (2, "Investigating Officer", 2),
            (3, "Writer", 3),
            (4, "Beat Officer", 4)
        ]
        designations = []
        for did, dname, so in designations_data:
            des = Designation(DesignationID=did, DesignationName=dname, Active=True, SortOrder=so)
            designations.append(des)
            session.add(des)
        session.flush()

        # 7. Employees (Officers & Staff)
        employees = []
        emp_id_counter = 1
        # Seed at least 3-4 officers per police station
        for ps in ps_units:
            # Add an Inspector as SHO
            sho = Employee(
                EmployeeID=emp_id_counter,
                DistrictID=ps.DistrictID,
                UnitID=ps.UnitID,
                RankID=5, # Inspector
                DesignationID=1, # SHO
                KGID=f"KG-{random.randint(10000, 99999)}",
                FirstName=f"Insp. {random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}",
                EmployeeDOB=date(1975 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28)),
                GenderID=1,
                BloodGroupID=random.randint(1, 8),
                PhysicallyChallenged=False,
                AppointmentDate=date(2000 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28))
            )
            employees.append(sho)
            session.add(sho)
            emp_id_counter += 1

            # Add two Sub-Inspectors as IOs
            for _ in range(2):
                io = Employee(
                    EmployeeID=emp_id_counter,
                    DistrictID=ps.DistrictID,
                    UnitID=ps.UnitID,
                    RankID=4, # Sub-Inspector
                    DesignationID=2, # Investigating Officer
                    KGID=f"KG-{random.randint(10000, 99999)}",
                    FirstName=f"SI {random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}",
                    EmployeeDOB=date(1980 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28)),
                    GenderID=1,
                    BloodGroupID=random.randint(1, 8),
                    PhysicallyChallenged=False,
                    AppointmentDate=date(2005 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28))
                )
                employees.append(io)
                session.add(io)
                emp_id_counter += 1

            # Add a couple of Constables
            for _ in range(2):
                constable = Employee(
                    EmployeeID=emp_id_counter,
                    DistrictID=ps.DistrictID,
                    UnitID=ps.UnitID,
                    RankID=1, # Constable
                    DesignationID=4, # Beat Officer
                    KGID=f"KG-{random.randint(10000, 99999)}",
                    FirstName=f"PC {random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}",
                    EmployeeDOB=date(1990 + random.randint(0, 12), random.randint(1, 12), random.randint(1, 28)),
                    GenderID=random.choice([1, 2]),
                    BloodGroupID=random.randint(1, 8),
                    PhysicallyChallenged=False,
                    AppointmentDate=date(2015 + random.randint(0, 8), random.randint(1, 12), random.randint(1, 28))
                )
                employees.append(constable)
                session.add(constable)
                emp_id_counter += 1
        session.flush()

        # 8. Courts
        courts = []
        court_id_counter = 1
        for dist in districts:
            c1 = Court(CourtID=court_id_counter, CourtName=f"JMFC Court, {dist.DistrictName}", DistrictID=dist.DistrictID, StateID=karnataka.StateID, Active=True)
            c2 = Court(CourtID=court_id_counter+1, CourtName=f"District & Sessions Court, {dist.DistrictName}", DistrictID=dist.DistrictID, StateID=karnataka.StateID, Active=True)
            courts.extend([c1, c2])
            session.add_all([c1, c2])
            court_id_counter += 2
        session.flush()

        # 9. Case Category
        cc_fir = CaseCategory(CaseCategoryID=1, LookupValue="FIR")
        cc_udr = CaseCategory(CaseCategoryID=2, LookupValue="UDR")
        cc_par = CaseCategory(CaseCategoryID=3, LookupValue="PAR")
        session.add_all([cc_fir, cc_udr, cc_par])
        session.flush()

        # 10. Gravity Offence
        go_h = GravityOffence(GravityOffenceID=1, LookupValue="Heinous")
        go_nh = GravityOffence(GravityOffenceID=2, LookupValue="Non-Heinous")
        session.add_all([go_h, go_nh])
        session.flush()

        # 11. Crime Head
        ch_body = CrimeHead(CrimeHeadID=1, CrimeGroupName="Crimes Against Body", Active=True)
        ch_prop = CrimeHead(CrimeHeadID=2, CrimeGroupName="Property Crimes", Active=True)
        ch_white = CrimeHead(CrimeHeadID=3, CrimeGroupName="White Collar Crimes", Active=True)
        ch_cyber = CrimeHead(CrimeHeadID=4, CrimeGroupName="Cyber Crimes", Active=True)
        ch_ndps = CrimeHead(CrimeHeadID=5, CrimeGroupName="Narcotic Crimes", Active=True)
        ch_order = CrimeHead(CrimeHeadID=6, CrimeGroupName="Crimes Against Public Order", Active=True)
        session.add_all([ch_body, ch_prop, ch_white, ch_cyber, ch_ndps, ch_order])
        session.flush()

        # 12. Crime Sub Head
        sub_heads = [
            (1, 1, "Murder", 1),
            (2, 1, "Kidnapping", 2),
            (3, 1, "Assault", 3),
            (4, 2, "Theft", 1),
            (5, 2, "Burglary", 2),
            (6, 2, "Robbery", 3),
            (7, 4, "Online Fraud", 1),
            (8, 4, "Hacking", 2),
            (9, 5, "Drug Trafficking", 1),
            (10, 6, "Rioting", 1)
        ]
        sub_head_objs = []
        for sh_id, h_id, sh_name, seq in sub_heads:
            sh = CrimeSubHead(CrimeSubHeadID=sh_id, CrimeHeadID=h_id, CrimeHeadName=sh_name, SeqID=seq)
            sub_head_objs.append(sh)
            session.add(sh)
        session.flush()

        # 13. Case Status Master
        csm_ui = CaseStatusMaster(CaseStatusID=1, CaseStatusName="Under Investigation")
        csm_cs = CaseStatusMaster(CaseStatusID=2, CaseStatusName="Charge Sheeted")
        csm_cl = CaseStatusMaster(CaseStatusID=3, CaseStatusName="Closed")
        session.add_all([csm_ui, csm_cs, csm_cl])
        session.flush()

        # 14. Caste Master
        caste_names = ["General", "OBC", "SC", "ST", "Scheduled Tribes", "Scheduled Castes", "Lingayat", "Vokkaliga", "Kuruba", "Muslims-Caste", "Other"]
        castes = []
        for idx, cname in enumerate(caste_names, start=1):
            cast = CasteMaster(caste_master_id=idx, caste_master_name=cname)
            castes.append(cast)
            session.add(cast)
        session.flush()

        # 15. Religion Master
        religions_data = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"]
        religions = []
        for idx, rname in enumerate(religions_data, start=1):
            rel = ReligionMaster(ReligionID=idx, ReligionName=rname)
            religions.append(rel)
            session.add(rel)
        session.flush()

        # 16. Occupation Master
        occupations_data = ["Farmer", "Government Employee", "Private Sector Employee", "Business Owner", "Laborer", "Student", "Unemployed", "Homemaker"]
        occupations = []
        for idx, oname in enumerate(occupations_data, start=1):
            occ = OccupationMaster(OccupationID=idx, OccupationName=oname)
            occupations.append(occ)
            session.add(occ)
        session.flush()

        # 17. Act
        ipc = Act(ActCode="IPC", ActDescription="Indian Penal Code 1860", ShortName="IPC", Active=True)
        ndps = Act(ActCode="NDPS", ActDescription="Narcotic Drugs and Psychotropic Substances Act 1985", ShortName="NDPS", Active=True)
        kpa = Act(ActCode="KPA", ActDescription="Karnataka Police Act 1963", ShortName="KPA", Active=True)
        it_act = Act(ActCode="IT_ACT", ActDescription="Information Technology Act 2000", ShortName="IT Act", Active=True)
        session.add_all([ipc, ndps, kpa, it_act])
        session.flush()

        # 18. Section
        sections_data = [
            ("IPC", "302", "Punishment for murder", True),
            ("IPC", "307", "Attempt to murder", True),
            ("IPC", "379", "Punishment for theft", True),
            ("IPC", "380", "Theft in dwelling house", True),
            ("IPC", "420", "Cheating and dishonestly inducing delivery of property", True),
            ("IPC", "395", "Punishment for dacoity", True),
            ("IT_ACT", "66D", "Punishment for cheating by personation by using computer resource", True),
            ("IT_ACT", "66", "Computer related offences", True),
            ("NDPS", "20", "Punishment for contravention in relation to cannabis plant and cannabis", True),
            ("NDPS", "22", "Punishment for contravention in relation to psychotropic substances", True),
            ("KPA", "92", "Punishment for certain street offences and nuisances", True)
        ]
        sections = []
        for acode, scode, sdesc, active in sections_data:
            sec = Section(ActCode=acode, SectionCode=scode, SectionDescription=sdesc, Active=active)
            sections.append(sec)
            session.add(sec)
        session.flush()

        # 19. CrimeHeadActSection (Junction Table Mapping)
        chas_data = [
            (1, "IPC", "302"), # Crimes Against Body -> Murder -> Section 302
            (1, "IPC", "307"), # Assault / Attempted Murder -> Section 307
            (2, "IPC", "379"), # Property Crimes -> Theft -> Section 379
            (2, "IPC", "380"), # Property Crimes -> Burglary/Theft in Dwelling -> Section 380
            (2, "IPC", "395"), # Property Crimes -> Robbery/Dacoity -> Section 395
            (4, "IT_ACT", "66D"), # Cyber Crimes -> Online Fraud -> IT Act 66D
            (5, "NDPS", "20"), # Narcotics -> Drug Trafficking -> NDPS Section 20
            (6, "KPA", "92")  # Public Order -> Rioting/Street nuisance -> KPA Section 92
        ]
        for ch_id, a_code, s_code in chas_data:
            chas = CrimeHeadActSection(CrimeHeadID=ch_id, ActCode=a_code, SectionCode=s_code)
            session.add(chas)
        session.flush()

        # 20. Seed CaseMaster & Dependent Details (120 mock cases)
        case_id_counter = 1
        compl_id_counter = 1
        victim_id_counter = 1
        accused_id_counter = 1
        arrest_id_counter = 1
        cs_id_counter = 1

        # We will create a pool of persistent offenders to show repeating networks!
        persistent_offenders = []
        for i in range(15):
            persistent_offenders.append({
                "name": f"{random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}",
                "age": random.randint(19, 45),
                "gender": 1, # Male
                "person_id": f"A{i+1}"
            })

        # Generate cases spanning the last 3 years to create rich trends
        start_date = datetime.now() - timedelta(days=365 * 3)
        
        for i in range(120):
            # Pick a random date
            days_offset = random.randint(0, 365 * 3)
            case_date = (start_date + timedelta(days=days_offset)).date()
            
            # Select category, district, police station
            ps = random.choice(ps_units)
            dist_id = ps.DistrictID
            district_name = [d.DistrictName for d in districts if d.DistrictID == dist_id][0]
            
            category = random.choice([cc_fir, cc_udr, cc_par])
            
            # Select Gravity and Crime Heads
            crime_head = random.choice([ch_body, ch_prop, ch_cyber, ch_ndps, ch_order])
            matching_subheads = [sh for sh in sub_head_objs if sh.CrimeHeadID == crime_head.CrimeHeadID]
            crime_subhead = random.choice(matching_subheads) if matching_subheads else sub_head_objs[0]
            
            gravity = go_h if crime_head.CrimeHeadID in [1, 5] else go_nh
            
            # Filter officers in this unit
            unit_officers = [emp for emp in employees if emp.UnitID == ps.UnitID]
            officer = random.choice(unit_officers) if unit_officers else employees[0]
            
            # Select Court
            unit_courts = [c for c in courts if c.DistrictID == dist_id]
            court = random.choice(unit_courts) if unit_courts else courts[0]
            
            # Case Status
            # Older cases are more likely to be solved/charge sheeted, newer under investigation
            age_days = (datetime.now().date() - case_date).days
            if age_days > 180:
                case_status = random.choice([csm_cs, csm_cl])
            else:
                case_status = random.choice([csm_ui, csm_cs])

            # Crime No format
            serial_no = i + 1
            crime_no = generate_crime_no(category.CaseCategoryID, dist_id, ps.UnitID, case_date.year, serial_no)
            case_no = generate_case_no(case_date.year, serial_no)

            case_master = CaseMaster(
                CaseMasterID=case_id_counter,
                CrimeNo=crime_no,
                CaseNo=case_no,
                CrimeRegisteredDate=case_date,
                PolicePersonID=officer.EmployeeID,
                PoliceStationID=ps.UnitID,
                CaseCategoryID=category.CaseCategoryID,
                GravityOffenceID=gravity.GravityOffenceID,
                CrimeMajorHeadID=crime_head.CrimeHeadID,
                CrimeMinorHeadID=crime_subhead.CrimeSubHeadID,
                CaseStatusID=case_status.CaseStatusID,
                CourtID=court.CourtID
            )
            session.add(case_master)

            # Inv_OccuranceTime (1-to-1)
            dist_coords = DISTRICT_COORDINATES[district_name]
            # Add minor random offset to coordinates for heatmap clustering
            lat = dist_coords[0] + random.uniform(-0.04, 0.04)
            lon = dist_coords[1] + random.uniform(-0.04, 0.04)
            
            incident_from = datetime.combine(case_date, datetime.min.time()) - timedelta(hours=random.randint(2, 48))
            incident_to = incident_from + timedelta(hours=random.randint(1, 4))
            info_rcvd = incident_to + timedelta(hours=random.randint(1, 12))

            # Brief Facts Template Generation
            v_name = f"{random.choice(MALE_NAMES if random.random() > 0.3 else FEMALE_NAMES)} {random.choice(LAST_NAMES)}"
            
            # Select Accused: 30% chance it's a repeat/persistent offender
            is_persistent = random.random() < 0.35
            if is_persistent:
                po = random.choice(persistent_offenders)
                acc_name = po["name"]
                acc_person_id = po["person_id"]
                acc_age = po["age"]
                acc_gender = po["gender"]
            else:
                acc_name = f"{random.choice(MALE_NAMES)} {random.choice(LAST_NAMES)}"
                acc_person_id = f"A{accused_id_counter}"
                acc_age = random.randint(18, 65)
                acc_gender = 1 if random.random() > 0.05 else 2

            sh_name = crime_subhead.CrimeHeadName
            brief_template = BRIEF_FACTS_TEMPLATES.get(sh_name, "Incident regarding {subhead} occurred at location.")
            brief_facts = brief_template.format(
                date=incident_from.strftime("%Y-%m-%d"),
                time=incident_from.strftime("%I:%M %p"),
                accused=acc_name,
                victim=v_name,
                motive=random.choice(MOTIVES),
                subhead=sh_name
            )

            occurance = Inv_OccuranceTime(
                CaseMasterID=case_id_counter,
                IncidentFromDate=incident_from,
                IncidentToDate=incident_to,
                InfoReceivedPSDate=info_rcvd,
                latitude=lat,
                longitude=lon,
                BriefFacts=brief_facts
            )
            session.add(occurance)

            # ComplainantDetails
            complainant = ComplainantDetails(
                ComplainantID=compl_id_counter,
                CaseMasterID=case_id_counter,
                ComplainantName=f"{random.choice(MALE_NAMES if random.random() > 0.2 else FEMALE_NAMES)} {random.choice(LAST_NAMES)}",
                AgeYear=random.randint(22, 70),
                OccupationID=random.choice(occupations).OccupationID,
                ReligionID=random.choice(religions).ReligionID,
                CasteID=random.choice(castes).caste_master_id,
                GenderID=random.choice([1, 2])
            )
            session.add(complainant)
            compl_id_counter += 1

            # Victim details
            v_gender_id = 1 if v_name.split()[0] in MALE_NAMES else 2
            victim = Victim(
                VictimMasterID=victim_id_counter,
                CaseMasterID=case_id_counter,
                VictimName=v_name,
                AgeYear=random.randint(12, 75),
                GenderID=v_gender_id,
                VictimPolice=str(random.choice([0, 0, 0, 0, 1])) # 20% chance victim is police
            )
            session.add(victim)
            victim_id_counter += 1

            # Accused details
            accused = Accused(
                AccusedMasterID=accused_id_counter,
                CaseMasterID=case_id_counter,
                AccusedName=acc_name,
                AgeYear=acc_age,
                GenderID=acc_gender,
                PersonID=acc_person_id
            )
            session.add(accused)

            # Act & Section Associations
            # Query matching sections for this CrimeHead
            act_secs = [c for c in chas_data if c[0] == crime_head.CrimeHeadID]
            if act_secs:
                for a_idx, (_, a_code, s_code) in enumerate(act_secs, start=1):
                    act_sec_assoc = ActSectionAssociation(
                        CaseMasterID=case_id_counter,
                        ActID=a_code,
                        SectionID=s_code,
                        ActOrderID=a_idx,
                        SectionOrderID=a_idx
                    )
                    session.add(act_sec_assoc)
            else:
                # Default backup
                act_sec_assoc = ActSectionAssociation(
                    CaseMasterID=case_id_counter,
                    ActID="IPC",
                    SectionID="379",
                    ActOrderID=1,
                    SectionOrderID=1
                )
                session.add(act_sec_assoc)

            # If solved (Charge Sheeted or Closed) - Add Arrest details (70% probability for older cases)
            if case_status.CaseStatusID in [2, 3] and random.random() > 0.15:
                arrest_date = case_date + timedelta(days=random.randint(2, 45))
                arrest = ArrestSurrender(
                    ArrestSurrenderID=arrest_id_counter,
                    CaseMasterID=case_id_counter,
                    ArrestSurrenderTypeID=random.choice([1, 1, 1, 2]), # 75% arrest, 25% voluntary surrender
                    ArrestSurrenderDate=arrest_date,
                    ArrestSurrenderStateId=karnataka.StateID,
                    ArrestSurrenderDistrictId=dist_id,
                    PoliceStationID=ps.UnitID,
                    IOID=officer.EmployeeID,
                    CourtID=court.CourtID,
                    AccusedMasterID=accused_id_counter,
                    IsAccused=True,
                    IsComplainantAccused=False
                )
                session.add(arrest)
                
                # Add to junction table
                junct = inv_arrestsurrenderaccused(
                    ArrestSurrenderID=arrest_id_counter,
                    AccusedMasterID=accused_id_counter
                )
                session.add(junct)
                arrest_id_counter += 1

                # If Charge Sheeted, add ChargesheetDetails
                if case_status.CaseStatusID == 2:
                    cs_date = arrest_date + timedelta(days=random.randint(15, 60))
                    cs = ChargesheetDetails(
                        CSID=cs_id_counter,
                        CaseMasterID=case_id_counter,
                        csdate=datetime.combine(cs_date, datetime.min.time()),
                        cstype=random.choice(['A', 'A', 'B', 'C']), # A-> Chargesheet, B->False Case, C->Undetected
                        PolicePersonID=officer.EmployeeID
                    )
                    session.add(cs)
                    cs_id_counter += 1

            accused_id_counter += 1
            case_id_counter += 1

        session.commit()
        print(f"Successfully seeded database with {case_id_counter-1} cases, {compl_id_counter-1} complainants, {victim_id_counter-1} victims, {accused_id_counter-1} accused, {arrest_id_counter-1} arrests, and {cs_id_counter-1} chargesheets.")
    except Exception as e:
        session.rollback()
        print("Error during database seeding:", e)
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_db()
