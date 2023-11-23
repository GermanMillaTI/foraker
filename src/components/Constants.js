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
    "Withdrawn",
    "Denali PPT"
  ],
  genders: [
    "Male",
    "Female",
    "Non-binary",
    "Prefer not to say"
  ],
  listOfAgeRanges: [
    "18-20",
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
    "Glasses - pr/ bf/ mf",
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
    "Failed - Comp.",
    "Failed - No Comp."
  ],
  pregnant: [
    "Yes",
    "No"
  ],
  columnsOfStats: {
    "Afr./Afr-Am./Black": [
      "African/African-American/Black"
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
    "Southeast Asian": [
      "Southeast Asian"
    ],
    "Med / Mid East & N. European": [
      "Middle Eastern/North African",
      "White - Southern European",
      "White - Northern European"
    ],
    'Other': [
      "Aboriginal Australians/Papuans",
      "Alaskan Native",
      "American Indian",
      "Native Hawaiian/Pacific Islander/Indigenous people of Oceania",
      "Prefer not to state",
      "Other"
    ],
    "Total": [
      "African/African-American/Black",
      "Middle Eastern/North African",
      "White - Southern European",
      "White - Northern European",
      "Hispanic/Latin American/Spanish",
      "East Asian",
      "South Asian",
      "Southeast Asian",
      "Aboriginal Australians/Papuans",
      "Alaskan Native",
      "American Indian",
      "Native Hawaiian/Pacific Islander/Indigenous people of Oceania",
      "Prefer not to state",
      "Other"
    ]
  },
  possibleNumberOfSessions: [
    1,
    2,
    3,
    4,
    5
  ],
  demoBinsEthnicities: {
    "African/African-American/Black": "1",
    "Middle Eastern/North African": "8",
    "White - Southern European": "8",
    "White - Northern European": "8",
    "Hispanic/Latin American/Spanish": "3",
    "East Asian": "4",
    "South Asian": "5",
    "Southeast Asian": "7",
    "Aboriginal Australians/Papuans": "9",
    "Alaskan Native": "9",
    "American Indian": "9",
    "Native Hawaiian/Pacific Islander/Indigenous people of Oceania": "9",
    "Prefer not to state": "9",
    "Other": "9"
  },
  demoBinsAgeRanges: {
    "18-20": "2",
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
  sources: {
    //"D2Models": "D2 Models",
    //"BGACasting": "BGA Casting",
    //"goodwork": "Goodwork",
    //"recruiter1": "Recruiter 1",
    //"recruiter2": "Recruiter 2",
    //"recruiter3": "Recruiter 3",
    "respondent": "Respondent",
    "Other": "Other"
  },
  bonuses: {
    b1: "Bonus",
    b2: "Short notice scheduling"
  },
  bonusEthnicities: {
    "Aboriginal Australians/Papuans": "Other",
    "African/African-American/Black": "AfrAfrAmBlack",
    "Alaskan Native": "Other",
    "American Indian": "Other",
    "East Asian": "EastAsian",
    "Hispanic/Latin American/Spanish": "LatinSAmer",
    "Native Hawaiian/Pacific Islander/Indigenous people of Oceania": "Other",
    "Middle Eastern/North African": "MedMidEast&NEuropean",
    "South Asian": "SouthAsian",
    "Southeast Asian": "SoutheastAsian",
    "White - Northern European": "MedMidEast&NEuropean",
    "White - Southern European": "MedMidEast&NEuropean",
    "Prefer not to state": "Other",
    "Other": "Other"
  },
  bonusEthnicities2: {
    "Afr./Afr-Am./Black": "AfrAfrAmBlack",
    "Med / Mid East & N. European": "MedMidEast&NEuropean",
    "East Asian": "EastAsian",
    "Latin / S. Amer": "LatinSAmer",
    "South Asian": "SouthAsian",
    "Southeast Asian": "SoutheastAsian",
    "Other": "Other"
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
  clientVisionCorrections: {
    "Contact Lens": "Contact lenses",
    "Glasses - Progressive": "Glasses - pr/ bf/ mf",
    "Glasses - Distance": "Glasses - distance",
    "Glasses - Reading": "Glasses - reading",
    "None": "None"
  },
  clientContributionStatuses: {
    0: "New",
    1: "In Progress",
    2: "Completed",
    3: "Archived",
    4: "Failed"
  },
  stillInterestedValues: [
    "Yes",
    "No",
    "N/A"
  ],
  industryCategories: [
    "Marketing and Media",
    "Technology",
    "Other",
    "N/A"
  ],
  sessionOutcomeStatuses: [
    "",
    "Completed - Positive",
    "Completed - Negative",
    "Incomplete - Negative",
    "Incomplete - Redo"
  ],
  sessionProtocols: [
    "",
    "Apple TV Only",
    "Random Activity",
  ],
  superAdmins: [
    'zoltan.bathori@telusinternational.com',
    'german.milla01@telusinternational.com',
    'sari.kiiskinen@telusinternational.com',
    'axel.romeo@telusinternational.com',
    'jessica.tucker@telusinternational.com',
    'sheiby.molina@telusinternational.com'
  ]
}

export default Constants;