export const ITEM_CATEGORIES = [
  "Electronics",
  "Documents",
  "Wallets",
  "Bags",
  "Accessories",
  "Keys",
  "Clothing",
  "Others",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_COLORS = [
  "Black",
  "Dark Blue / Navy",
  "Brown / Tan",
  "Grey / Silver",
  "White",
  "Red / Maroon",
  "Green",
  "Yellow / Gold",
  "Multi-colored",
  "Other",
] as const;

export const CUSTODY_TYPES = [
  { value: "WITH_FINDER", label: "In My Safe Possession (Finder)" },
  { value: "SECURITY_DESK", label: "Handed to Security Desk / Gate" },
  { value: "POLICE_STATION", label: "Deposited at Local Police Station" },
  { value: "LOST_AND_FOUND_OFFICE", label: "Deposited at Lost & Found Counter / Station Master" },
] as const;

export const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar (Aurangabad)',
    'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Jalgaon', 'Other City'
  ],
  'Delhi (NCT)': [
    'Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
    'West Delhi', 'Dwarka', 'Rohini', 'Connaught Place / Rajiv Chowk', 'Other Area'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru (Mysore)', 'Hubballi-Dharwad', 'Mangaluru (Mangalore)',
    'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Shimoga', 'Tumakuru', 'Other City'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem',
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Other City'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Noida', 'Greater Noida', 'Ghaziabad', 'Varanasi',
    'Agra', 'Prayagraj (Allahabad)', 'Meerut', 'Aligarh', 'Bareilly', 'Gorakhpur', 'Other City'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Secunderabad', 'Other City'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Other City'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman', 'Malda', 'Other City'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar', 'Other City'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Pathankot', 'Other City'
  ],
  'Haryana': [
    'Gurugram (Gurgaon)', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Panchkula', 'Other City'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi (Cochin)', 'Kozhikode (Calicut)', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Palakkad', 'Other City'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Other City'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Other City'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Other City'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Other City'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Other City'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Other City'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Other City'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Other City'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Baddi', 'Other City'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Other City'
  ],
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Other City'
  ],
  'Chandigarh (UT)': [
    'Chandigarh Sector 1-17', 'Chandigarh Sector 18-35', 'Chandigarh Sector 36-60', 'Manimajra', 'Other Area'
  ],
  'Other State / UT': [
    'Other City / Town'
  ],
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_AND_CITIES);

export function getCitiesForState(state: string): string[] {
  return INDIAN_STATES_AND_CITIES[state] || ['Other City / Town'];
}

// Flat list for legacy/fallback lookups
export const INDIAN_CITIES = Array.from(
  new Set(Object.values(INDIAN_STATES_AND_CITIES).flat())
);
