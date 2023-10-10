const Constants = {
  participantStatuses: [
    "",
    "Document Requested",
    "Contacted",
    "Scheduled",
    "Completed",
    "Not Selected",
    "Rejected",
    "Duplicate",
    "Withdrawn"
  ],
  genders: [
    "Male",
    "Female",
    "Non-binary",
    "Prefer not to say"
  ],
  listOfAgeRanges: [
    "13-14",
    "15-20",
    "21-30",
    "31-40",
    "41-50",
    "51-60",
    "61-70",
    "71-75"
  ],
  ethnicities: [
    "Aboriginal Australians/Papuans",
    "African/African-American/Black",
    "Alaskan Native",
    "American Indian",
    "East Asian",
    "Hispanic/Latin American/Spanish",
    "Native Hawaiian/Pacific Islander/Indigenous people of Oceania",
    "Middle Eastern/North African",
    "South Asian",
    "Southeast Asian",
    "White - Northern European",
    "White - Southern European",
    "Prefer not to state",
    "Other"
  ],
  visionCorrections: [
    "None",
    "Contact lenses",
    "Glasses - distance",
    "Glasses - progressive, bifocal or multifocal",
    "Glasses - reading"
  ],
  documentStatuses: [
    "",
    "Pass",
    "Pending",
    "Rejected"
  ],
  listOfModerators: [
    "",
    "First Moderator",
    "Second Moderator",
    "Third Moderator"
  ],
  sessionStatuses: [
    "Scheduled",
    "Checked In",
    "Completed",
    "Comp. for Waiting",
    "Rescheduled",
    "NoShow",
    "Withdrawn",
    "Failed",
    "Failed - Comp.",
    "Failed - No Comp."
  ],
  visionCorrections: [
    "Contact lenses",
    "Glasses - distance",
    "Glasses - progressive, bifocal or multifocal",
    "Glasses - reading",
    "None"
  ],
  skinTypes: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
  ],
  eyeColors: [
    "Black",
    "Blue",
    "Brown",
    "Green",
    "Grey",
    "Hazel",
    "Yellow",
    "Other"
  ],
  facialHairs: [
    "Beard",
    "Stubble",
    "Goatee",
    "None",
    "N/A"
  ],
  hairColors: [
    "Black",
    "Blond",
    "Brown",
    "Grey",
    "White",
    "Red",
    "Colorful",
    "N/A"
  ],
  hairLengths: [
    "None",
    "Short",
    "Medium",
    "Long"
  ],
  hairDensities: [
    "Thin",
    "Medium",
    "Thick"
  ],
  hairDiameters: [
    "Thin",
    "Medium",
    "Thick"
  ],
  hairTypes: [
    "Straight",
    "Wavy",
    "Curly",
    "Coily",
    "N/A"
  ],
  pregnant: [
    "Yes",
    "No"
  ],
  columnsOfStats: {
    "Afr./Afr-Am./Black": [
      "African/African-American/Black"
    ],
    "Med / Mid East": [
      "Middle Eastern/North African",
      "White - Southern European"
    ],
    "Latin / S. Amer": [
      "Hispanic/Latin American/Spanish"
    ],
    "East Asian": [
      "East Asian"
    ],
    "South Asian": [
      "South Asian"
    ],
    "N. European": [
      "White - Northern European"
    ],
    "Total": [
      "African/African-American/Black",
      "Middle Eastern/North African",
      "White - Southern European",
      "Hispanic/Latin American/Spanish",
      "East Asian",
      "South Asian",
      "White - Northern European"
    ]
  },
  possibleNumberOfSessions: [
    1,
    2,
    3,
    4,
    5
  ],
  bookingDictionary: {
    // Old slots
    "09:00": "09:00 am",
    "11:00": "11:00 am",
    "13:30": "01:30 pm",
    "15:30": "03:30 pm",
    "18:30": "06:30 pm",

    // New slots
    "08:30": "08:30 am",
    "10:15": "10:15 am",
    "12:30": "12:30 pm",
    "13:00": "01:00 pm",
    "14:15": "02:15 pm",
    "14:45": "02:45 pm",
    "16:30": "04:30 pm",
    "17:30": "05:30 pm",
    "18:15": "06:15 pm",
    "19:15": "07:15 pm",

    // New slots 2
    "09:30": "09:30 am",
    "11:15": "11:15 am",
    "14:00": "02:00 pm",
    "15:45": "03:45 pm",

    // New slots 3
    "10:45": "10:45 am",
    "17:00": "05:00 pm",
    "18:45": "06:45 pm"
  },
  demoBinsEthnicities: {
    "African/African-American/Black": "1",
    "Middle Eastern/North African": "2",
    "White - Southern European": "2",
    "Hispanic/Latin American/Spanish": "3",
    "East Asian": "4",
    "South Asian": "5",
    "White - Northern European": "6"
  },
  demoBinsAgeRanges: {
    "13-14": "1",
    "15-20": "2",
    "21-30": "3",
    "31-40": "4",
    "41-50": "5",
    "51-60": "6",
    "61-70": "7",
    "71-75": "8"
  },
  demoBinsGenders: {
    "Female": "0",
    "Male": "1"
  },
  phases: [
    "Blank",
    "Phase 1",
    "Phase 2",
    "Phase 2 Recall"
  ],
  sources: {
    "goodwork": "Goodwork",
    "recruiter1": "Recruiter 1",
    "recruiter2": "Recruiter 2",
    "recruiter3": "Recruiter 3",
    "respondent": "Respondent",
    "Other": "Other"
  },
  bonuses: {
    b1: "Bonus",
    b2: "Short notice scheduling"
  },
  bonusEthnicities: {
    "Aboriginal Australians/Papuans": "",
    "African/African-American/Black": "AfrAfrAmBlack",
    "Alaskan Native": "",
    "American Indian": "",
    "East Asian": "EastAsian",
    "Hispanic/Latin American/Spanish": "LatinSAmer",
    "Native Hawaiian/Pacific Islander/Indigenous people of Oceania": "",
    "Middle Eastern/North African": "MedMidEast",
    "South Asian": "SouthAsian",
    "Southeast Asian": "",
    "White - Northern European": "NEuropean",
    "White - Southern European": "MedMidEast",
    "Prefer not to state": "",
    "Other": ""
  },
  bonusEthnicities2: {
    "Afr./Afr-Am./Black": "AfrAfrAmBlack",
    "Med / Mid East": "MedMidEast",
    "East Asian": "EastAsian",
    "Latin / S. Amer": "LatinSAmer",
    "South Asian": "SouthAsian",
    "N. European": "NEuropean"
  },
  demoBinStatuses: [
    'Open',
    'Closed'
  ],
  demoBinStatusDictionary: {
    0: 'Open',
    1: 'Closed',
    2: 'Closed'
  },
  clientEthnicities: {
    'Aboriginal Australians / Papuans': 'Aboriginal Australians/Papuans',
    'African/African-American/Black': 'African/African-American/Black',
    'American Indian': 'American Indian',
    'East Asian': 'East Asian',
    'Latin America': 'Hispanic/Latin American/Spanish',
    'Middle Eastern/North African': 'Middle Eastern/North African',
    'N/A': 'N/A',
    'South Asian': 'South Asian',
    'Southeast Asian': 'Southeast Asian',
    'White - Northern European': 'White - Northern European',
    'White - Southern European': 'White - Southern European',
    'Prefer not to state': 'Prefer not to state'
  },
  superAdmins: [
    'zoltan.bathori@telusinternational.com',
    'german.milla01@telusinternational.com',
    'sari.kiiskinen@telusinternational.com',
    'axel.romeo@telusinternational.com',
    'jessica.tucker@telusinternational.com',
    'sheiby.molina@telusinternational.com'
  ],
  clientContributionStatuses: {
    0: "New",
    1: "In Progress",
    2: "Completed",
    3: "Archived",
    4: "Failed"
  }
}

export default Constants;