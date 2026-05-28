export type LinkItem = { label: string; url: string };

export type CountryMeta = {
  name: string;
  stats: {
    capital: string;
    searchCity: string;
    population: string;
    currency: string;
    languages: string[];
    coordinates: { lat: number; lng: number };
    airportCode: string;
    airportName: string;
  };
  industries: string[];
  jobBoards: LinkItem[];
  housing: LinkItem[];
};

export const REGIONAL_JOB_BOARDS: LinkItem[] = [
  { label: "CaribbeanJobs.com", url: "https://www.caribbeanjobs.com/" },
  { label: "LinkedIn Jobs (Caribbean)", url: "https://www.linkedin.com/jobs/" },
  { label: "Indeed", url: "https://www.indeed.com/" },
  { label: "CARICOM (CSME / Free Movement)", url: "https://caricom.org/" },
];

export const REGIONAL_HOUSING: LinkItem[] = [
  { label: "Airbnb", url: "https://www.airbnb.com/" },
  { label: "VRBO", url: "https://www.vrbo.com/" },
  {
    label: "Facebook Marketplace (Rentals)",
    url: "https://www.facebook.com/marketplace/",
  },
];

export const COUNTRY_META: Record<string, CountryMeta> = {
  TT: {
    name: "Trinidad and Tobago",
    stats: {
      capital: "Port of Spain",
      searchCity: "Port of Spain",
      population: "1.4 million",
      currency: "TTD",
      languages: ["English"],
      coordinates: { lat: 10.6603, lng: -61.5086 },
      airportCode: "POS",
      airportName: "Piarco International",
    },
    industries: [
      "Energy & Petrochemicals",
      "Fintech & Digital Payments",
      "Logistics & Trade",
      "Agri-processing",
      "Tourism & Events",
      "ICT & Software Services",
      "Creative Industries",
      "Manufacturing",
      "Financial Services",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Trinidad & Tobago)",
        url: "https://www.caribbeanjobs.com/Trinidad-and-Tobago",
      },
      {
        label: "LinkedIn Jobs (Trinidad & Tobago)",
        url: "https://www.linkedin.com/jobs/search/?location=Trinidad%20and%20Tobago",
      },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
      {
        label: "CSME Info (CARICOM)",
        url: "https://www.caricom.org/caribbean-single-market-and-economy-csme/",
      },
    ],
    housing: [
      { label: "Trinidad Property", url: "https://www.trinidadproperty.com/" },
      { label: "Pin.tt (Local Listings)", url: "https://www.pin.tt/" },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
    ],
  },

  BB: {
    name: "Barbados",
    stats: {
      capital: "Bridgetown",
      searchCity: "Bridgetown",
      population: "281,000",
      currency: "BBD",
      languages: ["English"],
      coordinates: { lat: 13.0975, lng: -59.6167 },
      airportCode: "BGI",
      airportName: "Grantley Adams International",
    },
    industries: [
      "Tourism & Hospitality",
      "International Business & Financial Services",
      "Renewable Energy",
      "FinTech",
      "Health & Wellness",
      "Education Services",
      "Creative Industries",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Barbados)",
        url: "https://www.caribbeanjobs.com/Barbados",
      },
      {
        label: "LinkedIn Jobs (Barbados)",
        url: "https://www.linkedin.com/jobs/search/?location=Barbados",
      },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "Property Barbados",
        url: "https://www.propertybarbados.com/",
      },
      { label: "Altman Real Estate", url: "https://altmanrealestate.com/" },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
    ],
  },

  JM: {
    name: "Jamaica",
    stats: {
      capital: "Kingston",
      searchCity: "Kingston",
      population: "2.8 million",
      currency: "JMD",
      languages: ["English"],
      coordinates: { lat: 18.1096, lng: -77.2975 },
      airportCode: "KIN",
      airportName: "Norman Manley International",
    },
    industries: [
      "Tourism",
      "Logistics",
      "BPO & Call Centers",
      "Music & Creative Economy",
      "Agribusiness",
      "ICT",
    ],
    jobBoards: [
      { label: "Jobs in Jamaica", url: "https://www.jobsjamaica.com" },
      {
        label: "CaribbeanJobs (Jamaica)",
        url: "https://www.caribbeanjobs.com/Jamaica",
      },
      {
        label: "LinkedIn Jobs (Jamaica)",
        url: "https://www.linkedin.com/jobs/search/?location=Jamaica",
      },
      { label: "Indeed (International)", url: "https://www.indeed.com" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "PropertyAds Jamaica",
        url: "https://www.propertyadsjamaica.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  GY: {
    name: "Guyana",
    stats: {
      capital: "Georgetown",
      searchCity: "Georgetown",
      population: "813,000",
      currency: "GYD",
      languages: ["English"],
      coordinates: { lat: 6.8013, lng: -58.1551 },
      airportCode: "GEO",
      airportName: "Cheddi Jagan International",
    },
    industries: [
      "Oil & Gas",
      "Construction",
      "Agriculture",
      "Logistics",
      "ICT",
      "Public Infrastructure",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "Indeed (International)", url: "https://www.indeed.com" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "Guyana Property (Listings)",
        url: "https://www.guyanaproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
    ],
  },

  LC: {
    name: "Saint Lucia",
    stats: {
      capital: "Castries",
      searchCity: "Castries",
      population: "184,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 13.9094, lng: -60.9789 },
      airportCode: "SLU",
      airportName: "George F. L. Charles Airport",
    },
    industries: [
      "Tourism",
      "Hospitality",
      "Renewable Energy",
      "Agriculture",
      "Wellness & Health",
      "Creative Services",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "St Lucia Property (Listings)",
        url: "https://www.stluciaproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  GD: {
    name: "Grenada",
    stats: {
      capital: "St. George's",
      searchCity: "St. George's",
      population: "113,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 12.1165, lng: -61.679 },
      airportCode: "GND",
      airportName: "Maurice Bishop International",
    },
    industries: [
      "Tourism",
      "Agriculture (Nutmeg, Cocoa)",
      "Education",
      "Renewable Energy",
      "Health Sciences",
      "Construction",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "Grenada Property (Listings)",
        url: "https://www.grenadaproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  DM: {
    name: "Dominica",
    stats: {
      capital: "Roseau",
      searchCity: "Roseau",
      population: "72,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 15.415, lng: -61.371 },
      airportCode: "DOM",
      airportName: "Douglas-Charles Airport",
    },
    industries: [
      "Eco-Tourism",
      "Geothermal Energy",
      "Agriculture",
      "Fisheries",
      "Wellness Tourism",
      "Construction",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  VC: {
    name: "St. Vincent and the Grenadines",
    stats: {
      capital: "Kingstown",
      searchCity: "Kingstown",
      population: "111,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 13.2528, lng: -61.1971 },
      airportCode: "SVD",
      airportName: "Argyle International",
    },
    industries: [
      "Tourism",
      "Agriculture",
      "Maritime Services",
      "Renewable Energy",
      "Construction",
      "Fisheries",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  KN: {
    name: "St. Kitts and Nevis",
    stats: {
      capital: "Basseterre",
      searchCity: "Basseterre",
      population: "53,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 17.3578, lng: -62.783 },
      airportCode: "SKB",
      airportName: "Robert L. Bradshaw International",
    },
    industries: [
      "Tourism",
      "Real Estate",
      "Citizenship by Investment",
      "Renewable Energy",
      "Financial Services",
      "Construction",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "St Kitts Property (Listings)",
        url: "https://www.stkittsproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  AG: {
    name: "Antigua and Barbuda",
    stats: {
      capital: "St. John's",
      searchCity: "St. John's",
      population: "99,000",
      currency: "XCD",
      languages: ["English"],
      coordinates: { lat: 17.0608, lng: -61.7964 },
      airportCode: "ANU",
      airportName: "V.C. Bird International",
    },
    industries: [
      "Tourism",
      "Yachting & Maritime",
      "Real Estate",
      "Renewable Energy",
      "Hospitality",
      "Financial Services",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "Antigua Property (Listings)",
        url: "https://www.antiguaproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  SR: {
    name: "Suriname",
    stats: {
      capital: "Paramaribo",
      searchCity: "Paramaribo",
      population: "623,000",
      currency: "SRD",
      languages: ["Dutch"],
      coordinates: { lat: 5.852, lng: -55.2038 },
      airportCode: "PBM",
      airportName: "Johan Adolf Pengel International",
    },
    industries: [
      "Mining",
      "Oil & Gas",
      "Agriculture",
      "Forestry",
      "Logistics",
      "ICT",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "Indeed (International)", url: "https://www.indeed.com" },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },

  BZ: {
    name: "Belize",
    stats: {
      capital: "Belmopan",
      searchCity: "Belize City",
      population: "405,000",
      currency: "BZD",
      languages: ["English"],
      coordinates: { lat: 17.1899, lng: -88.4976 },
      airportCode: "BZE",
      airportName: "Philip S. W. Goldson International",
    },
    industries: [
      "Tourism",
      "Agriculture",
      "Marine Conservation",
      "Eco-Tourism",
      "Renewable Energy",
      "ICT",
    ],
    jobBoards: [
      {
        label: "CaribbeanJobs (Regional)",
        url: "https://www.caribbeanjobs.com",
      },
      { label: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
      { label: "Indeed (International)", url: "https://www.indeed.com" },
      { label: "CARICOM Official", url: "https://www.caricom.org" },
    ],
    housing: [
      {
        label: "Belize Property (Listings)",
        url: "https://www.belizeproperty.com",
      },
      { label: "Airbnb (Short-term)", url: "https://www.airbnb.com" },
      { label: "VRBO (Short-term)", url: "https://www.vrbo.com" },
    ],
  },
};
