const Constants = {
  participantStatuses: [
    "",
    "Contacted",
    "Scheduled",
    "Completed",
    "Not Selected",
    "Rejected",
    "Duplicate",
    "Withdrawn"
  ],
  documentStatuses: [
    "",
    "Pass",
    "Pending",
    "Rejected"
  ],
  genders: [
    "Male",
    "Female",
    "Non-binary",
    "None of the above",
    "Prefer not to say"
  ],
  sources: {
    "Respondent": "Respondent",
    "Other": "Other"
  },
  listOfAgeRanges: [
    "18-29",
    "30-50",
    "51-65"

  ],
  tattooValues: [
    "Yes",
    "No"
  ],
  sessionStatuses: [
    "Scheduled",
    "Checked In",
    "Completed",
    "Rescheduled",
    "NoShow",
    "Withdrawn",
    "Failed - Comp.",
    "Failed - No Comp."
  ],
  clothingCategories: [
    "",
    "Hoodie",
    "Collared shirt",
    "T-Shirt",
    "Sleeveless Shirt",
    "Dress"
  ],
  hairCategories: [
    "",
    "Bald or Short Hair",
    "Bun or Pony Tail",
    "Shoulder Length or shorter worn down",
    "Longer than shoulder length worn down"
  ],
  facialHairCategories: [
    "",
    "None",
    "Short",
    "Long"
  ],
  demoBinsAgeRanges: {
    "18-29": "1",
    "30-50": "2",
    "51-65": "3",
  },

  demoBinsWeightRanges: {
    "<=49": "1",
    "50-69": "2",
    "70-89": "3",
    "90-110": "4",
    ">110": "5"
  },

  demoBinsHeights: {
    "<150": "1",
    "150-160": "2",
    "161-170": "3",
    "171-180": "4",
    "181-190": "5",
    ">190": "6",
  },

  listOfWeightsBinsAgeRanges: {
    "<=49": "1",
    "50-69": "2",
    "70-89": "3",
    "90-110": "4",
    ">110": "5",
  },


  demoBinsSkintoneRanges: {
    'Type-I: light pale white': "1",
    'Type-II: white, fair': "2",
    'Type-III: medium, white to light brown': "3",
    'Type-IV: olive, moderate brown': "4",
    'Type-V: brown, dark brown': "5",
    'Type-VI: very dark brown to black': "6",
  },
  demoBinsGenders: {
    "Female": "0",
    "Male": "1"
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
  superAdmins: [
    'zoltan.bathori@telusinternational.com',
    'german.milla01@telusinternational.com',
    'sari.kiiskinen@telusinternational.com',
    'axel.romeo@telusinternational.com',
    'jessica.tucker@telusinternational.com',
    'sheiby.molina@telusinternational.com',
    'zoltan.bathori@telusinternational.com',
    'nion.ruokamo@telusinternational.com'
  ],
  skinTone: [
    'Type-I: light pale white',
    'Type-II: white, fair',
    'Type-III: medium, white to light brown',
    'Type-IV: olive, moderate brown',
    'Type-V: brown, dark brown',
    'Type-VI: very dark brown to black',
  ],
  skintonesFilter: {
    'Type-I': 'Type-I: light pale white',
    'Type-II': 'Type-II: white, fair',
    'Type-III': 'Type-III: medium, white to light brown',
    'Type-IV': 'Type-IV: olive, moderate brown',
    'Type-V': 'Type-V: brown, dark brown',
    'Type-VI': 'Type-VI: very dark brown to black',
  },
  hairlength: [
    'None',
    'Short',
    'Medium',
    'Long'
  ],
  listOfWeights: [
    "<=49",
    "50-69",
    "70-89",
    "90-110",
    ">110"
  ],
  listOfHeights: [
    "<150",
    "150-160",
    "161-170",
    "171-180",
    "181-190",
    ">190"
  ]

}

export default Constants;