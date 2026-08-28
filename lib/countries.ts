/**
 * 195 sovereign countries — generated from src/data/countries.ts in the app
 * repo by scripts/sync-countries.mjs. Do not hand-edit: the /t/<ISO2> routes
 * exist so the app's share links resolve, and the two lists have to agree.
 */

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  continent: Continent;
  latitude: number;
  longitude: number;
}

export const COUNTRIES: Country[] = [
  {
    "iso2": "DZ",
    "iso3": "DZA",
    "name": "Algeria",
    "flag": "🇩🇿",
    "continent": "Africa",
    "latitude": 28.03,
    "longitude": 1.66
  },
  {
    "iso2": "AO",
    "iso3": "AGO",
    "name": "Angola",
    "flag": "🇦🇴",
    "continent": "Africa",
    "latitude": -11.2,
    "longitude": 17.87
  },
  {
    "iso2": "BJ",
    "iso3": "BEN",
    "name": "Benin",
    "flag": "🇧🇯",
    "continent": "Africa",
    "latitude": 9.31,
    "longitude": 2.32
  },
  {
    "iso2": "BW",
    "iso3": "BWA",
    "name": "Botswana",
    "flag": "🇧🇼",
    "continent": "Africa",
    "latitude": -22.33,
    "longitude": 24.68
  },
  {
    "iso2": "BF",
    "iso3": "BFA",
    "name": "Burkina Faso",
    "flag": "🇧🇫",
    "continent": "Africa",
    "latitude": 12.24,
    "longitude": -1.56
  },
  {
    "iso2": "BI",
    "iso3": "BDI",
    "name": "Burundi",
    "flag": "🇧🇮",
    "continent": "Africa",
    "latitude": -3.37,
    "longitude": 29.92
  },
  {
    "iso2": "CV",
    "iso3": "CPV",
    "name": "Cabo Verde",
    "flag": "🇨🇻",
    "continent": "Africa",
    "latitude": 16,
    "longitude": -24.01
  },
  {
    "iso2": "CM",
    "iso3": "CMR",
    "name": "Cameroon",
    "flag": "🇨🇲",
    "continent": "Africa",
    "latitude": 7.37,
    "longitude": 12.35
  },
  {
    "iso2": "CF",
    "iso3": "CAF",
    "name": "Central African Republic",
    "flag": "🇨🇫",
    "continent": "Africa",
    "latitude": 6.61,
    "longitude": 20.94
  },
  {
    "iso2": "TD",
    "iso3": "TCD",
    "name": "Chad",
    "flag": "🇹🇩",
    "continent": "Africa",
    "latitude": 15.45,
    "longitude": 18.73
  },
  {
    "iso2": "KM",
    "iso3": "COM",
    "name": "Comoros",
    "flag": "🇰🇲",
    "continent": "Africa",
    "latitude": -11.88,
    "longitude": 43.87
  },
  {
    "iso2": "CG",
    "iso3": "COG",
    "name": "Congo",
    "flag": "🇨🇬",
    "continent": "Africa",
    "latitude": -0.23,
    "longitude": 15.83
  },
  {
    "iso2": "CD",
    "iso3": "COD",
    "name": "Congo (DRC)",
    "flag": "🇨🇩",
    "continent": "Africa",
    "latitude": -4.04,
    "longitude": 21.76
  },
  {
    "iso2": "CI",
    "iso3": "CIV",
    "name": "Côte d'Ivoire",
    "flag": "🇨🇮",
    "continent": "Africa",
    "latitude": 7.54,
    "longitude": -5.55
  },
  {
    "iso2": "DJ",
    "iso3": "DJI",
    "name": "Djibouti",
    "flag": "🇩🇯",
    "continent": "Africa",
    "latitude": 11.83,
    "longitude": 42.59
  },
  {
    "iso2": "EG",
    "iso3": "EGY",
    "name": "Egypt",
    "flag": "🇪🇬",
    "continent": "Africa",
    "latitude": 26.82,
    "longitude": 30.8
  },
  {
    "iso2": "GQ",
    "iso3": "GNQ",
    "name": "Equatorial Guinea",
    "flag": "🇬🇶",
    "continent": "Africa",
    "latitude": 1.65,
    "longitude": 10.27
  },
  {
    "iso2": "ER",
    "iso3": "ERI",
    "name": "Eritrea",
    "flag": "🇪🇷",
    "continent": "Africa",
    "latitude": 15.18,
    "longitude": 39.78
  },
  {
    "iso2": "SZ",
    "iso3": "SWZ",
    "name": "Eswatini",
    "flag": "🇸🇿",
    "continent": "Africa",
    "latitude": -26.52,
    "longitude": 31.47
  },
  {
    "iso2": "ET",
    "iso3": "ETH",
    "name": "Ethiopia",
    "flag": "🇪🇹",
    "continent": "Africa",
    "latitude": 9.15,
    "longitude": 40.49
  },
  {
    "iso2": "GA",
    "iso3": "GAB",
    "name": "Gabon",
    "flag": "🇬🇦",
    "continent": "Africa",
    "latitude": -0.8,
    "longitude": 11.61
  },
  {
    "iso2": "GM",
    "iso3": "GMB",
    "name": "Gambia",
    "flag": "🇬🇲",
    "continent": "Africa",
    "latitude": 13.44,
    "longitude": -15.31
  },
  {
    "iso2": "GH",
    "iso3": "GHA",
    "name": "Ghana",
    "flag": "🇬🇭",
    "continent": "Africa",
    "latitude": 7.95,
    "longitude": -1.02
  },
  {
    "iso2": "GN",
    "iso3": "GIN",
    "name": "Guinea",
    "flag": "🇬🇳",
    "continent": "Africa",
    "latitude": 9.95,
    "longitude": -9.7
  },
  {
    "iso2": "GW",
    "iso3": "GNB",
    "name": "Guinea-Bissau",
    "flag": "🇬🇼",
    "continent": "Africa",
    "latitude": 11.8,
    "longitude": -15.18
  },
  {
    "iso2": "KE",
    "iso3": "KEN",
    "name": "Kenya",
    "flag": "🇰🇪",
    "continent": "Africa",
    "latitude": -0.02,
    "longitude": 37.91
  },
  {
    "iso2": "LS",
    "iso3": "LSO",
    "name": "Lesotho",
    "flag": "🇱🇸",
    "continent": "Africa",
    "latitude": -29.61,
    "longitude": 28.23
  },
  {
    "iso2": "LR",
    "iso3": "LBR",
    "name": "Liberia",
    "flag": "🇱🇷",
    "continent": "Africa",
    "latitude": 6.43,
    "longitude": -9.43
  },
  {
    "iso2": "LY",
    "iso3": "LBY",
    "name": "Libya",
    "flag": "🇱🇾",
    "continent": "Africa",
    "latitude": 26.34,
    "longitude": 17.23
  },
  {
    "iso2": "MG",
    "iso3": "MDG",
    "name": "Madagascar",
    "flag": "🇲🇬",
    "continent": "Africa",
    "latitude": -18.77,
    "longitude": 46.87
  },
  {
    "iso2": "MW",
    "iso3": "MWI",
    "name": "Malawi",
    "flag": "🇲🇼",
    "continent": "Africa",
    "latitude": -13.25,
    "longitude": 34.3
  },
  {
    "iso2": "ML",
    "iso3": "MLI",
    "name": "Mali",
    "flag": "🇲🇱",
    "continent": "Africa",
    "latitude": 17.57,
    "longitude": -4
  },
  {
    "iso2": "MR",
    "iso3": "MRT",
    "name": "Mauritania",
    "flag": "🇲🇷",
    "continent": "Africa",
    "latitude": 21.01,
    "longitude": -10.94
  },
  {
    "iso2": "MU",
    "iso3": "MUS",
    "name": "Mauritius",
    "flag": "🇲🇺",
    "continent": "Africa",
    "latitude": -20.35,
    "longitude": 57.55
  },
  {
    "iso2": "MA",
    "iso3": "MAR",
    "name": "Morocco",
    "flag": "🇲🇦",
    "continent": "Africa",
    "latitude": 31.79,
    "longitude": -7.09
  },
  {
    "iso2": "MZ",
    "iso3": "MOZ",
    "name": "Mozambique",
    "flag": "🇲🇿",
    "continent": "Africa",
    "latitude": -18.67,
    "longitude": 35.53
  },
  {
    "iso2": "NA",
    "iso3": "NAM",
    "name": "Namibia",
    "flag": "🇳🇦",
    "continent": "Africa",
    "latitude": -22.96,
    "longitude": 18.49
  },
  {
    "iso2": "NE",
    "iso3": "NER",
    "name": "Niger",
    "flag": "🇳🇪",
    "continent": "Africa",
    "latitude": 17.61,
    "longitude": 8.08
  },
  {
    "iso2": "NG",
    "iso3": "NGA",
    "name": "Nigeria",
    "flag": "🇳🇬",
    "continent": "Africa",
    "latitude": 9.08,
    "longitude": 8.68
  },
  {
    "iso2": "RW",
    "iso3": "RWA",
    "name": "Rwanda",
    "flag": "🇷🇼",
    "continent": "Africa",
    "latitude": -1.94,
    "longitude": 29.87
  },
  {
    "iso2": "ST",
    "iso3": "STP",
    "name": "São Tomé and Príncipe",
    "flag": "🇸🇹",
    "continent": "Africa",
    "latitude": 0.19,
    "longitude": 6.61
  },
  {
    "iso2": "SN",
    "iso3": "SEN",
    "name": "Senegal",
    "flag": "🇸🇳",
    "continent": "Africa",
    "latitude": 14.5,
    "longitude": -14.45
  },
  {
    "iso2": "SC",
    "iso3": "SYC",
    "name": "Seychelles",
    "flag": "🇸🇨",
    "continent": "Africa",
    "latitude": -4.68,
    "longitude": 55.49
  },
  {
    "iso2": "SL",
    "iso3": "SLE",
    "name": "Sierra Leone",
    "flag": "🇸🇱",
    "continent": "Africa",
    "latitude": 8.46,
    "longitude": -11.78
  },
  {
    "iso2": "SO",
    "iso3": "SOM",
    "name": "Somalia",
    "flag": "🇸🇴",
    "continent": "Africa",
    "latitude": 5.15,
    "longitude": 46.2
  },
  {
    "iso2": "ZA",
    "iso3": "ZAF",
    "name": "South Africa",
    "flag": "🇿🇦",
    "continent": "Africa",
    "latitude": -30.56,
    "longitude": 22.94
  },
  {
    "iso2": "SS",
    "iso3": "SSD",
    "name": "South Sudan",
    "flag": "🇸🇸",
    "continent": "Africa",
    "latitude": 6.88,
    "longitude": 31.31
  },
  {
    "iso2": "SD",
    "iso3": "SDN",
    "name": "Sudan",
    "flag": "🇸🇩",
    "continent": "Africa",
    "latitude": 12.86,
    "longitude": 30.22
  },
  {
    "iso2": "TZ",
    "iso3": "TZA",
    "name": "Tanzania",
    "flag": "🇹🇿",
    "continent": "Africa",
    "latitude": -6.37,
    "longitude": 34.89
  },
  {
    "iso2": "TG",
    "iso3": "TGO",
    "name": "Togo",
    "flag": "🇹🇬",
    "continent": "Africa",
    "latitude": 8.62,
    "longitude": 0.82
  },
  {
    "iso2": "TN",
    "iso3": "TUN",
    "name": "Tunisia",
    "flag": "🇹🇳",
    "continent": "Africa",
    "latitude": 33.89,
    "longitude": 9.54
  },
  {
    "iso2": "UG",
    "iso3": "UGA",
    "name": "Uganda",
    "flag": "🇺🇬",
    "continent": "Africa",
    "latitude": 1.37,
    "longitude": 32.29
  },
  {
    "iso2": "ZM",
    "iso3": "ZMB",
    "name": "Zambia",
    "flag": "🇿🇲",
    "continent": "Africa",
    "latitude": -13.13,
    "longitude": 27.85
  },
  {
    "iso2": "ZW",
    "iso3": "ZWE",
    "name": "Zimbabwe",
    "flag": "🇿🇼",
    "continent": "Africa",
    "latitude": -19.02,
    "longitude": 29.15
  },
  {
    "iso2": "AF",
    "iso3": "AFG",
    "name": "Afghanistan",
    "flag": "🇦🇫",
    "continent": "Asia",
    "latitude": 33.94,
    "longitude": 67.71
  },
  {
    "iso2": "AM",
    "iso3": "ARM",
    "name": "Armenia",
    "flag": "🇦🇲",
    "continent": "Asia",
    "latitude": 40.07,
    "longitude": 45.04
  },
  {
    "iso2": "AZ",
    "iso3": "AZE",
    "name": "Azerbaijan",
    "flag": "🇦🇿",
    "continent": "Asia",
    "latitude": 40.14,
    "longitude": 47.58
  },
  {
    "iso2": "BH",
    "iso3": "BHR",
    "name": "Bahrain",
    "flag": "🇧🇭",
    "continent": "Asia",
    "latitude": 26.07,
    "longitude": 50.56
  },
  {
    "iso2": "BD",
    "iso3": "BGD",
    "name": "Bangladesh",
    "flag": "🇧🇩",
    "continent": "Asia",
    "latitude": 23.68,
    "longitude": 90.36
  },
  {
    "iso2": "BT",
    "iso3": "BTN",
    "name": "Bhutan",
    "flag": "🇧🇹",
    "continent": "Asia",
    "latitude": 27.51,
    "longitude": 90.43
  },
  {
    "iso2": "BN",
    "iso3": "BRN",
    "name": "Brunei",
    "flag": "🇧🇳",
    "continent": "Asia",
    "latitude": 4.54,
    "longitude": 114.73
  },
  {
    "iso2": "KH",
    "iso3": "KHM",
    "name": "Cambodia",
    "flag": "🇰🇭",
    "continent": "Asia",
    "latitude": 12.57,
    "longitude": 104.99
  },
  {
    "iso2": "CN",
    "iso3": "CHN",
    "name": "China",
    "flag": "🇨🇳",
    "continent": "Asia",
    "latitude": 35.86,
    "longitude": 104.2
  },
  {
    "iso2": "CY",
    "iso3": "CYP",
    "name": "Cyprus",
    "flag": "🇨🇾",
    "continent": "Asia",
    "latitude": 35.13,
    "longitude": 33.43
  },
  {
    "iso2": "GE",
    "iso3": "GEO",
    "name": "Georgia",
    "flag": "🇬🇪",
    "continent": "Asia",
    "latitude": 42.32,
    "longitude": 43.36
  },
  {
    "iso2": "IN",
    "iso3": "IND",
    "name": "India",
    "flag": "🇮🇳",
    "continent": "Asia",
    "latitude": 20.59,
    "longitude": 78.96
  },
  {
    "iso2": "ID",
    "iso3": "IDN",
    "name": "Indonesia",
    "flag": "🇮🇩",
    "continent": "Asia",
    "latitude": -0.79,
    "longitude": 113.92
  },
  {
    "iso2": "IR",
    "iso3": "IRN",
    "name": "Iran",
    "flag": "🇮🇷",
    "continent": "Asia",
    "latitude": 32.43,
    "longitude": 53.69
  },
  {
    "iso2": "IQ",
    "iso3": "IRQ",
    "name": "Iraq",
    "flag": "🇮🇶",
    "continent": "Asia",
    "latitude": 33.22,
    "longitude": 43.68
  },
  {
    "iso2": "IL",
    "iso3": "ISR",
    "name": "Israel",
    "flag": "🇮🇱",
    "continent": "Asia",
    "latitude": 31.05,
    "longitude": 34.85
  },
  {
    "iso2": "JP",
    "iso3": "JPN",
    "name": "Japan",
    "flag": "🇯🇵",
    "continent": "Asia",
    "latitude": 36.2,
    "longitude": 138.25
  },
  {
    "iso2": "JO",
    "iso3": "JOR",
    "name": "Jordan",
    "flag": "🇯🇴",
    "continent": "Asia",
    "latitude": 30.59,
    "longitude": 36.24
  },
  {
    "iso2": "KZ",
    "iso3": "KAZ",
    "name": "Kazakhstan",
    "flag": "🇰🇿",
    "continent": "Asia",
    "latitude": 48.02,
    "longitude": 66.92
  },
  {
    "iso2": "KW",
    "iso3": "KWT",
    "name": "Kuwait",
    "flag": "🇰🇼",
    "continent": "Asia",
    "latitude": 29.31,
    "longitude": 47.48
  },
  {
    "iso2": "KG",
    "iso3": "KGZ",
    "name": "Kyrgyzstan",
    "flag": "🇰🇬",
    "continent": "Asia",
    "latitude": 41.2,
    "longitude": 74.77
  },
  {
    "iso2": "LA",
    "iso3": "LAO",
    "name": "Laos",
    "flag": "🇱🇦",
    "continent": "Asia",
    "latitude": 19.86,
    "longitude": 102.5
  },
  {
    "iso2": "LB",
    "iso3": "LBN",
    "name": "Lebanon",
    "flag": "🇱🇧",
    "continent": "Asia",
    "latitude": 33.85,
    "longitude": 35.86
  },
  {
    "iso2": "MY",
    "iso3": "MYS",
    "name": "Malaysia",
    "flag": "🇲🇾",
    "continent": "Asia",
    "latitude": 4.21,
    "longitude": 101.98
  },
  {
    "iso2": "MV",
    "iso3": "MDV",
    "name": "Maldives",
    "flag": "🇲🇻",
    "continent": "Asia",
    "latitude": 3.2,
    "longitude": 73.22
  },
  {
    "iso2": "MN",
    "iso3": "MNG",
    "name": "Mongolia",
    "flag": "🇲🇳",
    "continent": "Asia",
    "latitude": 46.86,
    "longitude": 103.85
  },
  {
    "iso2": "MM",
    "iso3": "MMR",
    "name": "Myanmar",
    "flag": "🇲🇲",
    "continent": "Asia",
    "latitude": 21.91,
    "longitude": 95.96
  },
  {
    "iso2": "NP",
    "iso3": "NPL",
    "name": "Nepal",
    "flag": "🇳🇵",
    "continent": "Asia",
    "latitude": 28.39,
    "longitude": 84.12
  },
  {
    "iso2": "KP",
    "iso3": "PRK",
    "name": "North Korea",
    "flag": "🇰🇵",
    "continent": "Asia",
    "latitude": 40.34,
    "longitude": 127.51
  },
  {
    "iso2": "OM",
    "iso3": "OMN",
    "name": "Oman",
    "flag": "🇴🇲",
    "continent": "Asia",
    "latitude": 21.51,
    "longitude": 55.92
  },
  {
    "iso2": "PK",
    "iso3": "PAK",
    "name": "Pakistan",
    "flag": "🇵🇰",
    "continent": "Asia",
    "latitude": 30.38,
    "longitude": 69.35
  },
  {
    "iso2": "PS",
    "iso3": "PSE",
    "name": "Palestine",
    "flag": "🇵🇸",
    "continent": "Asia",
    "latitude": 31.95,
    "longitude": 35.23
  },
  {
    "iso2": "PH",
    "iso3": "PHL",
    "name": "Philippines",
    "flag": "🇵🇭",
    "continent": "Asia",
    "latitude": 12.88,
    "longitude": 121.77
  },
  {
    "iso2": "QA",
    "iso3": "QAT",
    "name": "Qatar",
    "flag": "🇶🇦",
    "continent": "Asia",
    "latitude": 25.35,
    "longitude": 51.18
  },
  {
    "iso2": "SA",
    "iso3": "SAU",
    "name": "Saudi Arabia",
    "flag": "🇸🇦",
    "continent": "Asia",
    "latitude": 23.89,
    "longitude": 45.08
  },
  {
    "iso2": "SG",
    "iso3": "SGP",
    "name": "Singapore",
    "flag": "🇸🇬",
    "continent": "Asia",
    "latitude": 1.35,
    "longitude": 103.82
  },
  {
    "iso2": "KR",
    "iso3": "KOR",
    "name": "South Korea",
    "flag": "🇰🇷",
    "continent": "Asia",
    "latitude": 35.91,
    "longitude": 127.77
  },
  {
    "iso2": "LK",
    "iso3": "LKA",
    "name": "Sri Lanka",
    "flag": "🇱🇰",
    "continent": "Asia",
    "latitude": 7.87,
    "longitude": 80.77
  },
  {
    "iso2": "SY",
    "iso3": "SYR",
    "name": "Syria",
    "flag": "🇸🇾",
    "continent": "Asia",
    "latitude": 34.8,
    "longitude": 39
  },
  {
    "iso2": "TW",
    "iso3": "TWN",
    "name": "Taiwan",
    "flag": "🇹🇼",
    "continent": "Asia",
    "latitude": 23.7,
    "longitude": 120.96
  },
  {
    "iso2": "TJ",
    "iso3": "TJK",
    "name": "Tajikistan",
    "flag": "🇹🇯",
    "continent": "Asia",
    "latitude": 38.86,
    "longitude": 71.28
  },
  {
    "iso2": "TH",
    "iso3": "THA",
    "name": "Thailand",
    "flag": "🇹🇭",
    "continent": "Asia",
    "latitude": 15.87,
    "longitude": 100.99
  },
  {
    "iso2": "TL",
    "iso3": "TLS",
    "name": "Timor-Leste",
    "flag": "🇹🇱",
    "continent": "Asia",
    "latitude": -8.87,
    "longitude": 125.73
  },
  {
    "iso2": "TR",
    "iso3": "TUR",
    "name": "Turkey",
    "flag": "🇹🇷",
    "continent": "Asia",
    "latitude": 38.96,
    "longitude": 35.24
  },
  {
    "iso2": "TM",
    "iso3": "TKM",
    "name": "Turkmenistan",
    "flag": "🇹🇲",
    "continent": "Asia",
    "latitude": 38.97,
    "longitude": 59.56
  },
  {
    "iso2": "AE",
    "iso3": "ARE",
    "name": "United Arab Emirates",
    "flag": "🇦🇪",
    "continent": "Asia",
    "latitude": 23.42,
    "longitude": 53.85
  },
  {
    "iso2": "UZ",
    "iso3": "UZB",
    "name": "Uzbekistan",
    "flag": "🇺🇿",
    "continent": "Asia",
    "latitude": 41.38,
    "longitude": 64.59
  },
  {
    "iso2": "VN",
    "iso3": "VNM",
    "name": "Vietnam",
    "flag": "🇻🇳",
    "continent": "Asia",
    "latitude": 14.06,
    "longitude": 108.28
  },
  {
    "iso2": "YE",
    "iso3": "YEM",
    "name": "Yemen",
    "flag": "🇾🇪",
    "continent": "Asia",
    "latitude": 15.55,
    "longitude": 48.52
  },
  {
    "iso2": "AL",
    "iso3": "ALB",
    "name": "Albania",
    "flag": "🇦🇱",
    "continent": "Europe",
    "latitude": 41.15,
    "longitude": 20.17
  },
  {
    "iso2": "AD",
    "iso3": "AND",
    "name": "Andorra",
    "flag": "🇦🇩",
    "continent": "Europe",
    "latitude": 42.55,
    "longitude": 1.6
  },
  {
    "iso2": "AT",
    "iso3": "AUT",
    "name": "Austria",
    "flag": "🇦🇹",
    "continent": "Europe",
    "latitude": 47.52,
    "longitude": 14.55
  },
  {
    "iso2": "BY",
    "iso3": "BLR",
    "name": "Belarus",
    "flag": "🇧🇾",
    "continent": "Europe",
    "latitude": 53.71,
    "longitude": 27.95
  },
  {
    "iso2": "BE",
    "iso3": "BEL",
    "name": "Belgium",
    "flag": "🇧🇪",
    "continent": "Europe",
    "latitude": 50.5,
    "longitude": 4.47
  },
  {
    "iso2": "BA",
    "iso3": "BIH",
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦",
    "continent": "Europe",
    "latitude": 43.92,
    "longitude": 17.68
  },
  {
    "iso2": "BG",
    "iso3": "BGR",
    "name": "Bulgaria",
    "flag": "🇧🇬",
    "continent": "Europe",
    "latitude": 42.73,
    "longitude": 25.49
  },
  {
    "iso2": "HR",
    "iso3": "HRV",
    "name": "Croatia",
    "flag": "🇭🇷",
    "continent": "Europe",
    "latitude": 45.1,
    "longitude": 15.2
  },
  {
    "iso2": "CZ",
    "iso3": "CZE",
    "name": "Czech Republic",
    "flag": "🇨🇿",
    "continent": "Europe",
    "latitude": 49.82,
    "longitude": 15.47
  },
  {
    "iso2": "DK",
    "iso3": "DNK",
    "name": "Denmark",
    "flag": "🇩🇰",
    "continent": "Europe",
    "latitude": 56.26,
    "longitude": 9.5
  },
  {
    "iso2": "EE",
    "iso3": "EST",
    "name": "Estonia",
    "flag": "🇪🇪",
    "continent": "Europe",
    "latitude": 58.6,
    "longitude": 25.01
  },
  {
    "iso2": "FI",
    "iso3": "FIN",
    "name": "Finland",
    "flag": "🇫🇮",
    "continent": "Europe",
    "latitude": 61.92,
    "longitude": 25.75
  },
  {
    "iso2": "FR",
    "iso3": "FRA",
    "name": "France",
    "flag": "🇫🇷",
    "continent": "Europe",
    "latitude": 46.23,
    "longitude": 2.21
  },
  {
    "iso2": "DE",
    "iso3": "DEU",
    "name": "Germany",
    "flag": "🇩🇪",
    "continent": "Europe",
    "latitude": 51.17,
    "longitude": 10.45
  },
  {
    "iso2": "GR",
    "iso3": "GRC",
    "name": "Greece",
    "flag": "🇬🇷",
    "continent": "Europe",
    "latitude": 39.07,
    "longitude": 21.82
  },
  {
    "iso2": "HU",
    "iso3": "HUN",
    "name": "Hungary",
    "flag": "🇭🇺",
    "continent": "Europe",
    "latitude": 47.16,
    "longitude": 19.5
  },
  {
    "iso2": "IS",
    "iso3": "ISL",
    "name": "Iceland",
    "flag": "🇮🇸",
    "continent": "Europe",
    "latitude": 64.96,
    "longitude": -19.02
  },
  {
    "iso2": "IE",
    "iso3": "IRL",
    "name": "Ireland",
    "flag": "🇮🇪",
    "continent": "Europe",
    "latitude": 53.14,
    "longitude": -7.69
  },
  {
    "iso2": "IT",
    "iso3": "ITA",
    "name": "Italy",
    "flag": "🇮🇹",
    "continent": "Europe",
    "latitude": 41.87,
    "longitude": 12.57
  },
  {
    "iso2": "LV",
    "iso3": "LVA",
    "name": "Latvia",
    "flag": "🇱🇻",
    "continent": "Europe",
    "latitude": 56.88,
    "longitude": 24.6
  },
  {
    "iso2": "LI",
    "iso3": "LIE",
    "name": "Liechtenstein",
    "flag": "🇱🇮",
    "continent": "Europe",
    "latitude": 47.17,
    "longitude": 9.56
  },
  {
    "iso2": "LT",
    "iso3": "LTU",
    "name": "Lithuania",
    "flag": "🇱🇹",
    "continent": "Europe",
    "latitude": 55.17,
    "longitude": 23.88
  },
  {
    "iso2": "LU",
    "iso3": "LUX",
    "name": "Luxembourg",
    "flag": "🇱🇺",
    "continent": "Europe",
    "latitude": 49.82,
    "longitude": 6.13
  },
  {
    "iso2": "MT",
    "iso3": "MLT",
    "name": "Malta",
    "flag": "🇲🇹",
    "continent": "Europe",
    "latitude": 35.94,
    "longitude": 14.38
  },
  {
    "iso2": "MD",
    "iso3": "MDA",
    "name": "Moldova",
    "flag": "🇲🇩",
    "continent": "Europe",
    "latitude": 47.41,
    "longitude": 28.37
  },
  {
    "iso2": "MC",
    "iso3": "MCO",
    "name": "Monaco",
    "flag": "🇲🇨",
    "continent": "Europe",
    "latitude": 43.75,
    "longitude": 7.41
  },
  {
    "iso2": "ME",
    "iso3": "MNE",
    "name": "Montenegro",
    "flag": "🇲🇪",
    "continent": "Europe",
    "latitude": 42.71,
    "longitude": 19.37
  },
  {
    "iso2": "NL",
    "iso3": "NLD",
    "name": "Netherlands",
    "flag": "🇳🇱",
    "continent": "Europe",
    "latitude": 52.13,
    "longitude": 5.29
  },
  {
    "iso2": "MK",
    "iso3": "MKD",
    "name": "North Macedonia",
    "flag": "🇲🇰",
    "continent": "Europe",
    "latitude": 41.51,
    "longitude": 21.75
  },
  {
    "iso2": "NO",
    "iso3": "NOR",
    "name": "Norway",
    "flag": "🇳🇴",
    "continent": "Europe",
    "latitude": 60.47,
    "longitude": 8.47
  },
  {
    "iso2": "PL",
    "iso3": "POL",
    "name": "Poland",
    "flag": "🇵🇱",
    "continent": "Europe",
    "latitude": 51.92,
    "longitude": 19.15
  },
  {
    "iso2": "PT",
    "iso3": "PRT",
    "name": "Portugal",
    "flag": "🇵🇹",
    "continent": "Europe",
    "latitude": 39.4,
    "longitude": -8.22
  },
  {
    "iso2": "RO",
    "iso3": "ROU",
    "name": "Romania",
    "flag": "🇷🇴",
    "continent": "Europe",
    "latitude": 45.94,
    "longitude": 24.97
  },
  {
    "iso2": "RU",
    "iso3": "RUS",
    "name": "Russia",
    "flag": "🇷🇺",
    "continent": "Europe",
    "latitude": 61.52,
    "longitude": 105.32
  },
  {
    "iso2": "SM",
    "iso3": "SMR",
    "name": "San Marino",
    "flag": "🇸🇲",
    "continent": "Europe",
    "latitude": 43.94,
    "longitude": 12.46
  },
  {
    "iso2": "RS",
    "iso3": "SRB",
    "name": "Serbia",
    "flag": "🇷🇸",
    "continent": "Europe",
    "latitude": 44.02,
    "longitude": 21.01
  },
  {
    "iso2": "SK",
    "iso3": "SVK",
    "name": "Slovakia",
    "flag": "🇸🇰",
    "continent": "Europe",
    "latitude": 48.67,
    "longitude": 19.7
  },
  {
    "iso2": "SI",
    "iso3": "SVN",
    "name": "Slovenia",
    "flag": "🇸🇮",
    "continent": "Europe",
    "latitude": 46.15,
    "longitude": 14.99
  },
  {
    "iso2": "ES",
    "iso3": "ESP",
    "name": "Spain",
    "flag": "🇪🇸",
    "continent": "Europe",
    "latitude": 40.46,
    "longitude": -3.75
  },
  {
    "iso2": "SE",
    "iso3": "SWE",
    "name": "Sweden",
    "flag": "🇸🇪",
    "continent": "Europe",
    "latitude": 60.13,
    "longitude": 18.64
  },
  {
    "iso2": "CH",
    "iso3": "CHE",
    "name": "Switzerland",
    "flag": "🇨🇭",
    "continent": "Europe",
    "latitude": 46.82,
    "longitude": 8.23
  },
  {
    "iso2": "UA",
    "iso3": "UKR",
    "name": "Ukraine",
    "flag": "🇺🇦",
    "continent": "Europe",
    "latitude": 48.38,
    "longitude": 31.17
  },
  {
    "iso2": "GB",
    "iso3": "GBR",
    "name": "United Kingdom",
    "flag": "🇬🇧",
    "continent": "Europe",
    "latitude": 55.38,
    "longitude": -3.44
  },
  {
    "iso2": "AG",
    "iso3": "ATG",
    "name": "Antigua and Barbuda",
    "flag": "🇦🇬",
    "continent": "North America",
    "latitude": 17.06,
    "longitude": -61.8
  },
  {
    "iso2": "BS",
    "iso3": "BHS",
    "name": "Bahamas",
    "flag": "🇧🇸",
    "continent": "North America",
    "latitude": 25.03,
    "longitude": -77.4
  },
  {
    "iso2": "BB",
    "iso3": "BRB",
    "name": "Barbados",
    "flag": "🇧🇧",
    "continent": "North America",
    "latitude": 13.19,
    "longitude": -59.54
  },
  {
    "iso2": "BZ",
    "iso3": "BLZ",
    "name": "Belize",
    "flag": "🇧🇿",
    "continent": "North America",
    "latitude": 17.19,
    "longitude": -88.5
  },
  {
    "iso2": "CA",
    "iso3": "CAN",
    "name": "Canada",
    "flag": "🇨🇦",
    "continent": "North America",
    "latitude": 56.13,
    "longitude": -106.35
  },
  {
    "iso2": "CR",
    "iso3": "CRI",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "continent": "North America",
    "latitude": 9.75,
    "longitude": -83.75
  },
  {
    "iso2": "CU",
    "iso3": "CUB",
    "name": "Cuba",
    "flag": "🇨🇺",
    "continent": "North America",
    "latitude": 21.52,
    "longitude": -77.78
  },
  {
    "iso2": "DM",
    "iso3": "DMA",
    "name": "Dominica",
    "flag": "🇩🇲",
    "continent": "North America",
    "latitude": 15.41,
    "longitude": -61.37
  },
  {
    "iso2": "DO",
    "iso3": "DOM",
    "name": "Dominican Republic",
    "flag": "🇩🇴",
    "continent": "North America",
    "latitude": 18.74,
    "longitude": -70.16
  },
  {
    "iso2": "SV",
    "iso3": "SLV",
    "name": "El Salvador",
    "flag": "🇸🇻",
    "continent": "North America",
    "latitude": 13.79,
    "longitude": -88.9
  },
  {
    "iso2": "GD",
    "iso3": "GRD",
    "name": "Grenada",
    "flag": "🇬🇩",
    "continent": "North America",
    "latitude": 12.26,
    "longitude": -61.6
  },
  {
    "iso2": "GT",
    "iso3": "GTM",
    "name": "Guatemala",
    "flag": "🇬🇹",
    "continent": "North America",
    "latitude": 15.78,
    "longitude": -90.23
  },
  {
    "iso2": "HT",
    "iso3": "HTI",
    "name": "Haiti",
    "flag": "🇭🇹",
    "continent": "North America",
    "latitude": 18.97,
    "longitude": -72.29
  },
  {
    "iso2": "HN",
    "iso3": "HND",
    "name": "Honduras",
    "flag": "🇭🇳",
    "continent": "North America",
    "latitude": 15.2,
    "longitude": -86.24
  },
  {
    "iso2": "JM",
    "iso3": "JAM",
    "name": "Jamaica",
    "flag": "🇯🇲",
    "continent": "North America",
    "latitude": 18.11,
    "longitude": -77.3
  },
  {
    "iso2": "MX",
    "iso3": "MEX",
    "name": "Mexico",
    "flag": "🇲🇽",
    "continent": "North America",
    "latitude": 23.63,
    "longitude": -102.55
  },
  {
    "iso2": "NI",
    "iso3": "NIC",
    "name": "Nicaragua",
    "flag": "🇳🇮",
    "continent": "North America",
    "latitude": 12.87,
    "longitude": -85.21
  },
  {
    "iso2": "PA",
    "iso3": "PAN",
    "name": "Panama",
    "flag": "🇵🇦",
    "continent": "North America",
    "latitude": 8.54,
    "longitude": -80.78
  },
  {
    "iso2": "KN",
    "iso3": "KNA",
    "name": "Saint Kitts and Nevis",
    "flag": "🇰🇳",
    "continent": "North America",
    "latitude": 17.36,
    "longitude": -62.78
  },
  {
    "iso2": "LC",
    "iso3": "LCA",
    "name": "Saint Lucia",
    "flag": "🇱🇨",
    "continent": "North America",
    "latitude": 13.91,
    "longitude": -60.98
  },
  {
    "iso2": "VC",
    "iso3": "VCT",
    "name": "Saint Vincent and the Grenadines",
    "flag": "🇻🇨",
    "continent": "North America",
    "latitude": 12.98,
    "longitude": -61.29
  },
  {
    "iso2": "TT",
    "iso3": "TTO",
    "name": "Trinidad and Tobago",
    "flag": "🇹🇹",
    "continent": "North America",
    "latitude": 10.69,
    "longitude": -61.22
  },
  {
    "iso2": "US",
    "iso3": "USA",
    "name": "United States",
    "flag": "🇺🇸",
    "continent": "North America",
    "latitude": 37.09,
    "longitude": -95.71
  },
  {
    "iso2": "AR",
    "iso3": "ARG",
    "name": "Argentina",
    "flag": "🇦🇷",
    "continent": "South America",
    "latitude": -38.42,
    "longitude": -63.62
  },
  {
    "iso2": "BO",
    "iso3": "BOL",
    "name": "Bolivia",
    "flag": "🇧🇴",
    "continent": "South America",
    "latitude": -16.29,
    "longitude": -63.59
  },
  {
    "iso2": "BR",
    "iso3": "BRA",
    "name": "Brazil",
    "flag": "🇧🇷",
    "continent": "South America",
    "latitude": -14.24,
    "longitude": -51.93
  },
  {
    "iso2": "CL",
    "iso3": "CHL",
    "name": "Chile",
    "flag": "🇨🇱",
    "continent": "South America",
    "latitude": -35.68,
    "longitude": -71.54
  },
  {
    "iso2": "CO",
    "iso3": "COL",
    "name": "Colombia",
    "flag": "🇨🇴",
    "continent": "South America",
    "latitude": 4.57,
    "longitude": -74.3
  },
  {
    "iso2": "EC",
    "iso3": "ECU",
    "name": "Ecuador",
    "flag": "🇪🇨",
    "continent": "South America",
    "latitude": -1.83,
    "longitude": -78.18
  },
  {
    "iso2": "GY",
    "iso3": "GUY",
    "name": "Guyana",
    "flag": "🇬🇾",
    "continent": "South America",
    "latitude": 4.86,
    "longitude": -58.93
  },
  {
    "iso2": "PY",
    "iso3": "PRY",
    "name": "Paraguay",
    "flag": "🇵🇾",
    "continent": "South America",
    "latitude": -23.44,
    "longitude": -58.44
  },
  {
    "iso2": "PE",
    "iso3": "PER",
    "name": "Peru",
    "flag": "🇵🇪",
    "continent": "South America",
    "latitude": -9.19,
    "longitude": -75.02
  },
  {
    "iso2": "SR",
    "iso3": "SUR",
    "name": "Suriname",
    "flag": "🇸🇷",
    "continent": "South America",
    "latitude": 3.92,
    "longitude": -56.03
  },
  {
    "iso2": "UY",
    "iso3": "URY",
    "name": "Uruguay",
    "flag": "🇺🇾",
    "continent": "South America",
    "latitude": -32.52,
    "longitude": -55.77
  },
  {
    "iso2": "VE",
    "iso3": "VEN",
    "name": "Venezuela",
    "flag": "🇻🇪",
    "continent": "South America",
    "latitude": 6.42,
    "longitude": -66.59
  },
  {
    "iso2": "AU",
    "iso3": "AUS",
    "name": "Australia",
    "flag": "🇦🇺",
    "continent": "Oceania",
    "latitude": -25.27,
    "longitude": 133.78
  },
  {
    "iso2": "FJ",
    "iso3": "FJI",
    "name": "Fiji",
    "flag": "🇫🇯",
    "continent": "Oceania",
    "latitude": -17.71,
    "longitude": 178.07
  },
  {
    "iso2": "KI",
    "iso3": "KIR",
    "name": "Kiribati",
    "flag": "🇰🇮",
    "continent": "Oceania",
    "latitude": -3.37,
    "longitude": -168.73
  },
  {
    "iso2": "MH",
    "iso3": "MHL",
    "name": "Marshall Islands",
    "flag": "🇲🇭",
    "continent": "Oceania",
    "latitude": 7.13,
    "longitude": 171.18
  },
  {
    "iso2": "FM",
    "iso3": "FSM",
    "name": "Micronesia",
    "flag": "🇫🇲",
    "continent": "Oceania",
    "latitude": 7.43,
    "longitude": 150.55
  },
  {
    "iso2": "NR",
    "iso3": "NRU",
    "name": "Nauru",
    "flag": "🇳🇷",
    "continent": "Oceania",
    "latitude": -0.52,
    "longitude": 166.93
  },
  {
    "iso2": "NZ",
    "iso3": "NZL",
    "name": "New Zealand",
    "flag": "🇳🇿",
    "continent": "Oceania",
    "latitude": -40.9,
    "longitude": 174.89
  },
  {
    "iso2": "PW",
    "iso3": "PLW",
    "name": "Palau",
    "flag": "🇵🇼",
    "continent": "Oceania",
    "latitude": 7.51,
    "longitude": 134.58
  },
  {
    "iso2": "PG",
    "iso3": "PNG",
    "name": "Papua New Guinea",
    "flag": "🇵🇬",
    "continent": "Oceania",
    "latitude": -6.31,
    "longitude": 143.96
  },
  {
    "iso2": "WS",
    "iso3": "WSM",
    "name": "Samoa",
    "flag": "🇼🇸",
    "continent": "Oceania",
    "latitude": -13.76,
    "longitude": -172.1
  },
  {
    "iso2": "SB",
    "iso3": "SLB",
    "name": "Solomon Islands",
    "flag": "🇸🇧",
    "continent": "Oceania",
    "latitude": -9.65,
    "longitude": 160.16
  },
  {
    "iso2": "TO",
    "iso3": "TON",
    "name": "Tonga",
    "flag": "🇹🇴",
    "continent": "Oceania",
    "latitude": -21.18,
    "longitude": -175.2
  },
  {
    "iso2": "TV",
    "iso3": "TUV",
    "name": "Tuvalu",
    "flag": "🇹🇻",
    "continent": "Oceania",
    "latitude": -7.11,
    "longitude": 177.65
  },
  {
    "iso2": "VU",
    "iso3": "VUT",
    "name": "Vanuatu",
    "flag": "🇻🇺",
    "continent": "Oceania",
    "latitude": -15.38,
    "longitude": 166.96
  }
];

const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function getCountryByIso2(code: string): Country | undefined {
  return BY_ISO2.get(code.toUpperCase());
}
