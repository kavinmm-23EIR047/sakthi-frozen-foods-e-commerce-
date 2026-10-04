import { calculateDistanceKm, calculateCoimbatoreBikeFee, SHOP_COORDINATES } from './deliveryRates';

export interface CoimbatoreAreaItem {
  id: string;
  name: string;
  zoneName: string;
  pincode: string;
  lat: number;
  lng: number;
  popular?: boolean;
  subAreas: string[];
  landmarks: string[];
  aliases: string[];
}

export interface CoimbatoreSearchResult {
  id: string;
  title: string;
  subtitle: string;
  areaName: string;
  subArea?: string;
  pincode: string;
  lat: number;
  lng: number;
  distanceKm: number;
  deliveryFee: number;
  isPopular: boolean;
  displayName: string;
  isCustomOsm?: boolean;
}

export const COIMBATORE_MASTER_AREAS: CoimbatoreAreaItem[] = [
  // ─── 1. NORTH & WEST COIMBATORE (NEAR STORE / 0 - 8 KM) ───
  {
    id: 'koundampalayam',
    name: 'Koundampalayam',
    zoneName: 'North Coimbatore',
    pincode: '641030',
    lat: 11.0431,
    lng: 76.8135,
    popular: true,
    subAreas: ['Peons Colony', 'Kalpana Theatre Road', 'Edayarpalayam Road', 'Housing Unit', 'Tank Road', 'Ranga Layout', 'Goundampalayam', 'Nallampalayam Road', 'Shanthi Nagar', 'Ashok Nagar'],
    landmarks: ['Kalpana Theatre', 'Sakthi Frozen Foods Store', 'Peons Colony Bus Stop', 'Government ITI', 'Koundampalayam Flyover'],
    aliases: ['koundampalayam', 'goundampalayam', 'kavundampalayam', 'peons colony', 'puens colony', 'kalpana theatre', 'tank road'],
  },
  {
    id: 'edayarpalayam',
    name: 'Edayarpalayam',
    zoneName: 'West Coimbatore',
    pincode: '641025',
    lat: 11.0335,
    lng: 76.9150,
    popular: true,
    subAreas: ['Thadagam Road', 'Baba Nagar', 'Vadavalli Link Road', 'Bharathi Nagar', 'Subbammal Layout', 'Sri Nagar', 'KVB Colony', 'Ramakrishnapuram', 'Maruthi Nagar'],
    landmarks: ['Edayarpalayam Junction', 'Amman Mess', 'Bharathi Nagar Bus Stop', 'Thadagam Main Road'],
    aliases: ['edayarpalayam', 'idaiyarpalayam', 'baba nagar', 'subbammal layout'],
  },
  {
    id: 'saibaba_colony',
    name: 'Saibaba Colony',
    zoneName: 'Central-West Coimbatore',
    pincode: '641011',
    lat: 11.0264,
    lng: 76.9419,
    popular: true,
    subAreas: ['NSR Road', 'Alagesan Road', 'Bharathi Park Cross 1-8', 'Kalingarayan Street', 'VCS Nagar', 'Kamatchi Nagar', 'Ramalinga Colony', 'Indira Nagar', 'Shankar Nagar'],
    landmarks: ['Saibaba Temple', 'NSR Road Commercial Area', 'Ganga Hospital Nearby', 'Bharathi Park', 'Alagesan Road Cross'],
    aliases: ['saibaba colony', 'nsr road', 'alagesan road', 'bharathi park', 'saibaba kovil', 'ramalinga colony'],
  },
  {
    id: 'thudiyalur',
    name: 'Thudiyalur',
    zoneName: 'North Coimbatore',
    pincode: '641034',
    lat: 11.0772,
    lng: 76.9385,
    popular: true,
    subAreas: ['Vellakinar Pirivu', 'NGGO Colony', 'Kanuvai Road', 'Railway Feeder Road', 'Urumandampalayam', 'Appanaickenpalayam', 'Vasantham Nagar', 'Ashok Nagar Thudiyalur', 'Panchayat Office Road'],
    landmarks: ['Thudiyalur Bus Stand', 'Thudiyalur Junction', 'Reliance Smart Point', 'NGGO Colony Ground', 'Sri Krishna Sweets Thudiyalur'],
    aliases: ['thudiyalur', 'nggo colony', 'vellakinar pirivu', 'urumandampalayam', 'appanaickenpalayam'],
  },
  {
    id: 'vadavalli',
    name: 'Vadavalli',
    zoneName: 'West Coimbatore',
    pincode: '641041',
    lat: 11.0289,
    lng: 76.9022,
    popular: true,
    subAreas: ['Maruthamalai Road', 'Mullai Nagar', 'Navavoor Pirivu', 'Maharani Avenue', 'IOB Colony', 'EB Colony', 'Vadavalli Bus Terminus', 'Bommanampalayam', 'Anna Nagar Vadavalli'],
    landmarks: ['Vadavalli Bus Stand', 'Maruthamalai Road Arch', 'Maharani Avenue', 'Navavoor Junction'],
    aliases: ['vadavalli', 'mullai nagar', 'navavoor pirivu', 'maharani avenue', 'maruthamalai road vadavalli'],
  },
  {
    id: 'pn_pudur',
    name: 'PN Pudur (Pappanaicken Pudur)',
    zoneName: 'West Coimbatore',
    pincode: '641041',
    lat: 11.0225,
    lng: 76.9190,
    popular: true,
    subAreas: ['Maruthamalai Main Road', 'Sundapalayam Road', 'Telungupalayam Pudur', 'Sugunapuram East', 'Thondamuthur Road Link', 'Anna Nagar PN Pudur'],
    landmarks: ['PN Pudur Bus Stop', 'Bharathiar University Road Branch', 'Sundapalayam Junction'],
    aliases: ['pn pudur', 'pappanaicken pudur', 'p n pudur'],
  },
  {
    id: 'gn_mills',
    name: 'GN Mills (Gnanambika Mills)',
    zoneName: 'North Coimbatore',
    pincode: '641029',
    lat: 11.0620,
    lng: 76.9380,
    popular: true,
    subAreas: ['MTP Road', 'Vellakinar Road', 'Kongu Nagar', 'Thoppampatti Pirivu', 'K.V.R. Nagar'],
    landmarks: ['GN Mills Post Office', 'Mettupalayam Road Flyover', 'Gnanambika Mills Bus Stop'],
    aliases: ['gn mills', 'gnanambika mills', 'thoppampatti pirivu'],
  },
  {
    id: 'veerakeralam',
    name: 'Veerakeralam',
    zoneName: 'West Coimbatore',
    pincode: '641007',
    lat: 11.0125,
    lng: 76.8970,
    popular: false,
    subAreas: ['Sugunapuram', 'Shanthi Nagar', 'Thondamuthur Road', 'Linganoor', 'Lakshmi Nagar'],
    landmarks: ['Veerakeralam Bus Stop', 'Sugunapuram School', 'Linganoor Junction'],
    aliases: ['veerakeralam', 'sugunapuram', 'linganoor'],
  },
  {
    id: 'kanuvai',
    name: 'Kanuvai',
    zoneName: 'North-West Coimbatore',
    pincode: '641108',
    lat: 11.0630,
    lng: 76.8920,
    popular: false,
    subAreas: ['Thadagam Road', 'Somayampalayam', 'Kalveerampalayam', 'Nanjundapuram West'],
    landmarks: ['Kanuvai Checkpost', 'Kanuvai Bus Stop', 'Thadagam Valley View'],
    aliases: ['kanuvai', 'somayampalayam', 'kalveerampalayam'],
  },
  {
    id: 'pannimadai',
    name: 'Pannimadai',
    zoneName: 'North-West Coimbatore',
    pincode: '641017',
    lat: 11.0740,
    lng: 76.9080,
    popular: false,
    subAreas: ['Vadamadurai', 'Thadagam Link', 'Kaveri Nagar', 'Pannimadai Panchayat'],
    landmarks: ['Pannimadai Junction', 'Vadamadurai Pirivu'],
    aliases: ['pannimadai', 'vadamadurai'],
  },

  // ─── 2. CENTRAL COIMBATORE (COMMERCIAL & RESIDENTIAL) ───
  {
    id: 'rs_puram',
    name: 'R.S. Puram (Rathinasabapathipuram)',
    zoneName: 'Central Coimbatore',
    pincode: '641002',
    lat: 11.0089,
    lng: 76.9507,
    popular: true,
    subAreas: ['DB Road (Diwan Bahadur Road)', 'TV Samy Road (West & East)', 'Cowley Brown Road', 'Ramachandra Road', 'Sir Shanmugam Road', 'Sukrawarpet Link', 'Flower Market', 'R.S. Puram West', 'Light House Road', 'Bhasyakaralu Road'],
    landmarks: ['Annapoorna DB Road', 'Post Office RS Puram', 'Senthil Kumaran Theatre', 'Corporation Ground', 'Milk Company Junction'],
    aliases: ['rs puram', 'r s puram', 'db road', 'tv samy road', 'diwan bahadur road', 'cowley brown road', 'rathinasabapathipuram'],
  },
  {
    id: 'gandhipuram',
    name: 'Gandhipuram',
    zoneName: 'Central Coimbatore',
    pincode: '641012',
    lat: 11.0168,
    lng: 76.9673,
    popular: true,
    subAreas: ['Cross Cut Road', '100 Feet Road', '7th Street', '5th Street', 'Central Bus Stand Area', 'SETC Bus Stand', 'Town Bus Stand Area', 'Dr. Nanjappa Road', 'Sathyamangalam Road Starting', 'Bharathiyar Road'],
    landmarks: ['Gandhipuram Central Bus Stand', 'Cross Cut Road Shopping Complex', 'GP Signal', 'Brookefields Mall Link', 'Sri Krishna Sweets Cross Cut Road'],
    aliases: ['gandhipuram', 'cross cut road', '100 feet road', 'dr nanjappa road', 'gandhipuram bus stand'],
  },
  {
    id: 'town_hall',
    name: 'Town Hall',
    zoneName: 'Central-South Coimbatore',
    pincode: '641001',
    lat: 10.9974,
    lng: 76.9634,
    popular: true,
    subAreas: ['Oppanakara Street', 'Raja Street', 'Big Bazaar Street', 'Sukrawarpet', 'Gandhipark', 'Manikoondu (Clock Tower)', 'NH Road', 'Thomas Street', 'Wyllie Street'],
    landmarks: ['Town Hall Clock Tower (Manikoondu)', 'Koniamman Temple', 'Victoria Town Hall', 'Coimbatore Railway Junction Area', 'Big Bazaar Shopping Street'],
    aliases: ['town hall', 'townhall', 'oppanakara street', 'raja street', 'big bazaar street', 'sukrawarpet', 'gandhipark', 'manikoondu'],
  },
  {
    id: 'race_course',
    name: 'Race Course',
    zoneName: 'Central-East Coimbatore',
    pincode: '641018',
    lat: 11.0047,
    lng: 76.9744,
    popular: true,
    subAreas: ['Race Course Road', 'Thomas Park', 'Nehru Stadium Road', 'Circuit House Area', 'Police Commissioner Office Road', 'All India Radio Road', 'Court Road'],
    landmarks: ['Race Course Walking Track', 'Nehru Stadium', 'Thomas Park', 'Taj Vivanta / The Residency', 'Income Tax Office'],
    aliases: ['race course', 'racecourse', 'thomas park', 'nehru stadium coimbatore'],
  },
  {
    id: 'tatabad',
    name: 'Tatabad',
    zoneName: 'Central-North Coimbatore',
    pincode: '641012',
    lat: 11.0210,
    lng: 76.9630,
    popular: true,
    subAreas: ['Power House Area', '1st to 11th Street Tatabad', 'Forest College Road', 'Hudco Tatabad', 'Dr. Radhakrishnan Road'],
    landmarks: ['TNEB Power House', 'Tatabad Murugan Temple', 'Forest College Ground'],
    aliases: ['tatabad', 'power house tatabad', 'thathabad'],
  },
  {
    id: 'ramnagar',
    name: 'Ramnagar',
    zoneName: 'Central Coimbatore',
    pincode: '641009',
    lat: 11.0118,
    lng: 76.9622,
    popular: true,
    subAreas: ['Sastri Road', 'Ansari Street', 'Kalingarayan Street', 'Geetha Hall Road', 'Kattoor Area', 'Ramnagar West'],
    landmarks: ['Ramamar Temple Ramnagar', 'Geetha Hall', 'Sastri Road Junction', 'Hotel City Tower'],
    aliases: ['ramnagar', 'ram nagar', 'sastri road', 'kattoor'],
  },
  {
    id: 'siddhapudur',
    name: 'Siddhapudur',
    zoneName: 'Central-East Coimbatore',
    pincode: '641044',
    lat: 11.0195,
    lng: 76.9760,
    popular: true,
    subAreas: ['Avarampalayam Road', 'VKK Menon Road', 'SNR College Road', 'Balasundaram Road', 'Sri Ramakrishna Hospital Area'],
    landmarks: ['Sri Ramakrishna Hospital', 'SNR Sons College', 'Ayyappan Temple Siddhapudur'],
    aliases: ['siddhapudur', 'sidhapudur', 'vkk menon road', 'ramakrishna hospital'],
  },
  {
    id: 'pappanaickenpalayam',
    name: 'Pappanaickenpalayam (PN Palayam)',
    zoneName: 'Central-East Coimbatore',
    pincode: '641037',
    lat: 11.0142,
    lng: 76.9856,
    popular: true,
    subAreas: ['Mani High School Road', 'G.K.D Nagar', 'Lakshmi Mills Junction', 'Nethaji Road', 'Ramakrishnapuram', 'Kamarajar Road PN Palayam'],
    landmarks: ['Lakshmi Mills Junction', 'Mani Higher Secondary School', 'G.K.D. Memorial Hospital link'],
    aliases: ['pappanaickenpalayam', 'pn palayam', 'p n palayam', 'lakshmi mills'],
  },
  {
    id: 'sivananda_colony',
    name: 'Sivananda Colony',
    zoneName: 'Central-North Coimbatore',
    pincode: '641012',
    lat: 11.0315,
    lng: 76.9535,
    popular: true,
    subAreas: ['Hudco Colony', 'Teachers Colony', 'Sivananda Cross 1-6', 'Mettupalayam Highway link', 'E.B. Colony Sivananda'],
    landmarks: ['Sivananda Colony Signal', 'MTP Road Flyover entrance', 'Government Polytechnic College nearby'],
    aliases: ['sivananda colony', 'sivanandha colony', 'hudco sivananda'],
  },
  {
    id: 'rathinapuri',
    name: 'Rathinapuri',
    zoneName: 'Central-North Coimbatore',
    pincode: '641027',
    lat: 11.0340,
    lng: 76.9680,
    popular: false,
    subAreas: ['Kannappa Nagar', 'Sanganoor Road', '8th Street Rathinapuri', 'Murugan Nagar', 'Subash Nagar', 'K.R. Puram'],
    landmarks: ['Rathinapuri Bus Stop', 'Kannappa Nagar Junction', 'Sanganoor Bridge'],
    aliases: ['rathinapuri', 'kannappa nagar', 'sanganoor'],
  },
  {
    id: 'avarampalayam',
    name: 'Avarampalayam',
    zoneName: 'Central-North Coimbatore',
    pincode: '641006',
    lat: 11.0265,
    lng: 76.9855,
    popular: true,
    subAreas: ['Illango Nagar', 'Bharathi Nagar Avarampalayam', 'B.R. Puram', 'Ganapathy Link Road', 'Pilamedu Link Road'],
    landmarks: ['Sri Ramakrishna Dental College', 'Avarampalayam Flyover Junction', 'B.R. Puram Playground'],
    aliases: ['avarampalayam', 'illango nagar', 'br puram'],
  },

  // ─── 3. EAST & IT CORRIDOR (PEELAMEDU, SARAVANAMPATTI, AVINASHI ROAD) ───
  {
    id: 'peelamedu',
    name: 'Peelamedu',
    zoneName: 'East Coimbatore',
    pincode: '641004',
    lat: 11.0284,
    lng: 77.0018,
    popular: true,
    subAreas: ['Avinashi Road', 'PSG Tech Campus', 'PSG Medical College Area', 'Codissia Link', 'Nava India Road', 'Fun Republic Mall Area', 'Hopes College', 'Krishnammal College Area', 'B.R. Nagar', 'Pioneer Mill Road'],
    landmarks: ['PSG College of Technology', 'Fun Republic Mall', 'Nava India Signal', 'Peelamedu Railway Station', 'PSG IMS&R Hospital'],
    aliases: ['peelamedu', 'psg tech', 'nava india', 'fun republic mall', 'fun mall', 'pilamedu'],
  },
  {
    id: 'hopes_college',
    name: 'Hopes College (BR Puram / Peelamedu)',
    zoneName: 'East Coimbatore',
    pincode: '641004',
    lat: 11.0260,
    lng: 77.0120,
    popular: true,
    subAreas: ['Avinashi Road Hopes', 'Krishnammal College Road', 'Tidel Park Road Link', 'Masakalipalayam Road', 'Ellai Thottam Road', 'Water Tank Road Hopes'],
    landmarks: ['Hopes College Bus Stand', 'PSGR Krishnammal College', 'Hopes Flyover', 'TIDEL Park Turn'],
    aliases: ['hopes college', 'hopes', 'hope college', 'krishnammal college'],
  },
  {
    id: 'sitra_airport',
    name: 'Sitra / Coimbatore Airport Area',
    zoneName: 'East Coimbatore',
    pincode: '641014',
    lat: 11.0345,
    lng: 77.0370,
    popular: true,
    subAreas: ['Civil Aerodrome Post', 'Airport Road', 'KMCH Hospital Area', 'Goldwins', 'Nehru Nagar Sitra', 'Avinashi Road Bypass', 'Chitra Junction', 'Vasanth Nagar Sitra'],
    landmarks: ['Coimbatore International Airport (CJB)', 'KMCH Multi-Speciality Hospital', 'SITRA Auditorium', 'Goldwins Bus Stop', 'Aravind Eye Hospital'],
    aliases: ['sitra', 'chitra', 'coimbatore airport', 'civil aerodrome', 'kmch', 'goldwins', 'nehru nagar sitra'],
  },
  {
    id: 'kalapatti',
    name: 'Kalapatti',
    zoneName: 'North-East Coimbatore',
    pincode: '641048',
    lat: 11.0715,
    lng: 77.0220,
    popular: true,
    subAreas: ['Nehru Nagar Kalapatti', 'Sharp Nagar', 'KGISL IT Park Link', 'Kurumbapalayam Road', 'SITRA - Kalapatti Road', 'Mylampatti Link', 'Vilankurichi Link Road', 'Balaji Nagar Kalapatti'],
    landmarks: ['Nalanda School', 'Kalapatti Four Roads Junction', 'Airport IT Corridor', 'Sharp Industries'],
    aliases: ['kalapatti', 'kalappatti', 'nehru nagar kalapatti', 'sharp nagar'],
  },
  {
    id: 'saravanampatti',
    name: 'Saravanampatti (IT SEZ Hub)',
    zoneName: 'North-East Coimbatore',
    pincode: '641035',
    lat: 11.0797,
    lng: 76.9995,
    popular: true,
    subAreas: ['CHIL SEZ IT Park', 'Sathy Road Saravanampatti', 'Keeranatham Road', 'KGISL Campus', 'Cognizant / Bosch Area', 'Prozone Mall Link', 'Viswasapuram', 'Amman Kovil Nagar', 'Sivanandhapuram'],
    landmarks: ['CHIL SEZ IT Park (TCS, CTS, Bosch)', 'KGISL Institute of Tech', 'Prozone Mall Nearby', 'Saravanampatti Police Station Signal', 'Amrita Vidyalayam'],
    aliases: ['saravanampatti', 'saravanampatty', 'chil sez', 'kgisl', 'sathy road saravanampatti', 'viswasapuram', 'sivanandhapuram'],
  },
  {
    id: 'ganapathy',
    name: 'Ganapathy',
    zoneName: 'North-East Coimbatore',
    pincode: '641006',
    lat: 11.0410,
    lng: 76.9790,
    popular: true,
    subAreas: ['Sathy Road Ganapathy', 'Textool Area', 'Maniakaranpalayam', 'Athipalayam Pirivu', 'Ganapathy Bus Stand', 'Ganapathy Pudur', 'CMS School Road', 'Police Quarters Ganapathy', 'LMW Road Link', 'Anna Nagar Ganapathy'],
    landmarks: ['Ganapathy Bus Stand', 'Textool Company', 'Athipalayam Pirivu Signal', 'LMW Campus Link', 'Ganapathy Murugan Temple'],
    aliases: ['ganapathy', 'ganapathi', 'maniakaranpalayam', 'athipalayam pirivu', 'ganapathy pudur', 'textool'],
  },
  {
    id: 'chinnavedampatti',
    name: 'Chinnavedampatti',
    zoneName: 'North-East Coimbatore',
    pincode: '641049',
    lat: 11.0670,
    lng: 76.9880,
    popular: true,
    subAreas: ['Kumaraguru College (KCT) Area', 'KCT Tech Park', 'Athipalayam Road', 'Saravanampatti Link', 'Sri Krishna Nagar', 'Teachers Colony Chinnavedampatti'],
    landmarks: ['Kumaraguru College of Technology (KCT)', 'KCT Tech Park', 'Chinnavedampatti Lake'],
    aliases: ['chinnavedampatti', 'chinnavedampatty', 'kumaraguru', 'kct'],
  },
  {
    id: 'vilankurichi',
    name: 'Vilankurichi',
    zoneName: 'East Coimbatore',
    pincode: '641035',
    lat: 11.0550,
    lng: 77.0080,
    popular: true,
    subAreas: ['TIDEL Park Coimbatore Area', 'Cheran Ma Nagar Link', 'GRG Nagar', 'IT SEZ Road', 'Maheswari Nagar', 'Sri Ram Nagar Vilankurichi'],
    landmarks: ['TIDEL Park Coimbatore', 'ELCOT SEZ', 'Vilankurichi Bus Stop', 'GRG Matriculation School'],
    aliases: ['vilankurichi', 'vilankurichi road', 'tidel park coimbatore', 'tidel park'],
  },
  {
    id: 'cheran_ma_nagar',
    name: 'Cheran Ma Nagar',
    zoneName: 'East Coimbatore',
    pincode: '641035',
    lat: 11.0480,
    lng: 77.0040,
    popular: true,
    subAreas: ['Vilankurichi Main Road', 'HUDCO Colony Cheran Ma Nagar', 'Balamurugan Nagar', 'Phase 1 & Phase 2', 'Water Tank Road'],
    landmarks: ['Cheran Ma Nagar Bus Terminus', 'Balamurugan Temple', 'Government High School'],
    aliases: ['cheran ma nagar', 'cheranmanagar', 'cheran nagar east'],
  },
  {
    id: 'singanallur',
    name: 'Singanallur',
    zoneName: 'South-East Coimbatore',
    pincode: '641005',
    lat: 10.9980,
    lng: 77.0250,
    popular: true,
    subAreas: ['Trichy Road Singanallur', 'Singanallur Bus Stand', 'Kamarajar Road', 'Neelikonampalayam', 'Varadharajapuram', 'Ondipudur Road Link', 'Singanallur Lake Area', 'Kallimadai', 'Nanjundapuram Road Link'],
    landmarks: ['Singanallur Bus Stand (Outstation Buses)', 'Singanallur Railway Station', 'Singanallur Boat House / Lake', 'Kallimadai Bus Stop'],
    aliases: ['singanallur', 'singanallur bus stand', 'neelikonampalayam', 'varadharajapuram', 'kallimadai'],
  },
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram (Trichy Road)',
    zoneName: 'Central-East Coimbatore',
    pincode: '641045',
    lat: 11.0015,
    lng: 76.9920,
    popular: true,
    subAreas: ['Trichy Road Ramanathapuram', 'Sungam Bypass', 'Redfields', 'Alvernia School Area', 'Sowripalayam Pirivu', 'Pankaja Mills Road', 'Olympus', 'Nanjundapuram Road Entrance'],
    landmarks: ['Sungam Junction Flyover', 'Alvernia Matriculation School', 'Ramanathapuram Signal (Trichy Road)', 'Redfields Area'],
    aliases: ['ramanathapuram', 'ramanathapuram coimbatore', 'sungam', 'redfields', 'sowripalayam pirivu', 'olympus'],
  },
  {
    id: 'sowripalayam',
    name: 'Sowripalayam',
    zoneName: 'East Coimbatore',
    pincode: '641028',
    lat: 11.0090,
    lng: 77.0060,
    popular: false,
    subAreas: ['Puliakulam Road Link', 'Meena Estate', 'Krishnasamy Nagar', 'Ramanathapuram Link', 'Udayampalayam Link'],
    landmarks: ['Sowripalayam Church', 'Meena Estate Bus Stop', 'G.V. Residency Link'],
    aliases: ['sowripalayam', 'meena estate', 'udayampalayam'],
  },
  {
    id: 'ondipudur',
    name: 'Ondipudur',
    zoneName: 'East Coimbatore',
    pincode: '641016',
    lat: 10.9970,
    lng: 77.0480,
    popular: true,
    subAreas: ['Trichy Road Ondipudur', 'Irugur Road Link', 'Odderpalayam', 'Shanthi Gears Road', 'Ondipudur Flyover Area', 'Nethaji Nagar', 'Kannampalayam Link'],
    landmarks: ['Ondipudur Bus Stand / Depot', 'Ondipudur Flyover', 'Shanthi Social Services (SSS)', 'Shanthi Gears'],
    aliases: ['ondipudur', 'ondiputhur', 'shanthi social services', 'shanthi gears'],
  },
  {
    id: 'neelambur',
    name: 'Neelambur',
    zoneName: 'East Coimbatore (Avinashi Highway)',
    pincode: '641062',
    lat: 11.0590,
    lng: 77.0860,
    popular: true,
    subAreas: ['Avinashi Road Highway', 'PSG iTech Campus', 'Le Meridien Hotel Area', 'Neelambur Toll Plaza Area', 'Kathir College Area', 'Muthugoundenpudur Link'],
    landmarks: ['Le Meridien Hotel', 'PSG Institute of Technology (PSG iTech)', 'Neelambur Bypass Junction', 'Kathir College of Engineering'],
    aliases: ['neelambur', 'neelambur toll', 'psg itech', 'le meridien'],
  },
  {
    id: 'irugur',
    name: 'Irugur',
    zoneName: 'East Coimbatore',
    pincode: '641103',
    lat: 11.0110,
    lng: 77.0580,
    popular: false,
    subAreas: ['Irugur Railway Station', 'AG Pudur', 'Ondipudur Link Road', 'Kattabomman Nagar', 'Ravathur Link'],
    landmarks: ['Irugur Railway Junction', 'Irugur Panchayat Office', 'IOCL / BPCL Terminal Nearby'],
    aliases: ['irugur', 'ag pudur', 'ravathur'],
  },
  {
    id: 'sulur',
    name: 'Sulur',
    zoneName: 'Outer East Coimbatore',
    pincode: '641402',
    lat: 11.0270,
    lng: 77.1260,
    popular: true,
    subAreas: ['Air Force Station Area', 'Trichy Road Sulur', 'Ranganathapuram', 'Kangayampalayam', 'Sulur Lake / Boat Club', 'Kalangal Road', 'RVS College Area'],
    landmarks: ['Sulur Air Force Station (5 BRD)', 'RVS Educational Trust Campus', 'Sulur Lake', 'Sulur Bus Stand'],
    aliases: ['sulur', 'air force station sulur', 'kangayampalayam', 'rvs college'],
  },

  // ─── 4. SOUTH & POLLACHI / PALAKKAD CORRIDOR ───
  {
    id: 'ukkadam',
    name: 'Ukkadam',
    zoneName: 'South Coimbatore',
    pincode: '641001',
    lat: 10.9880,
    lng: 76.9580,
    popular: true,
    subAreas: ['Ukkadam Bus Stand', 'Perur Bypass Road', 'Sungam Bypass', 'Karumbukadai', 'Bilal Estate', 'GM Nagar', 'Al-Ameen Colony', 'Fish Market Area', 'Valankulam Lake Promenade'],
    landmarks: ['Ukkadam Bus Stand (Pollachi/Palakkad/Madurai)', 'Ukkadam Flyover', 'Periyakulam Smart City Lakefront', 'Karumbukadai Signal'],
    aliases: ['ukkadam', 'karumbukadai', 'perur bypass', 'valankulam ukkadam'],
  },
  {
    id: 'kuniyamuthur',
    name: 'Kuniyamuthur',
    zoneName: 'South-West Coimbatore',
    pincode: '641008',
    lat: 10.9630,
    lng: 76.9510,
    popular: true,
    subAreas: ['Palakkad Main Road', 'Sri Krishna College Area (SKCET / SKASC)', 'Sundakamuthur Road', 'Kovai Pudur Pirivu', 'Babu Nagar', 'Puttuvikki Link', 'B.K. Pudur', 'Ashok Nagar Kuniyamuthur'],
    landmarks: ['Sri Krishna College of Engineering & Tech (SKCET)', 'Kuniyamuthur Bus Stop', 'Sundakamuthur Junction', 'Palakkad Road Toll Plaza link'],
    aliases: ['kuniyamuthur', 'kuniamuthur', 'sri krishna college', 'sundakamuthur', 'bk pudur'],
  },
  {
    id: 'kovaipudur',
    name: 'Kovaipudur (Little Ooty)',
    zoneName: 'South-West Coimbatore',
    pincode: '641042',
    lat: 10.9380,
    lng: 76.9380,
    popular: true,
    subAreas: ['CBM College Area', 'Ashram School Road', 'VLB Janakiammal College', 'Telephone Exchange Area', 'Gokulam Colony', 'Kovaipudur T Block', 'Al-Ameen Engineering College Link', 'Shanthi Ashram Road'],
    landmarks: ['CBM Arts & Science College', 'VLB Janakiammal College', 'Kovaipudur Bus Terminus', 'Ashram School', 'Kovaipudur Sports Ground'],
    aliases: ['kovaipudur', 'kovai pudur', 'little ooty', 'cbm college', 'vlb college'],
  },
  {
    id: 'sundarapuram',
    name: 'Sundarapuram',
    zoneName: 'South Coimbatore',
    pincode: '641024',
    lat: 10.9520,
    lng: 76.9740,
    popular: true,
    subAreas: ['Pollachi Main Road', 'LIC Colony Sundarapuram', 'SIDCO Industrial Estate Link', 'Madukkarai Market Road', 'Kamraj Nagar', 'Machampalayam', 'Kurichi Housing Unit'],
    landmarks: ['Sundarapuram Junction', 'SIDCO Industrial Estate', 'Kurichi Lakefront', 'LIC Colony Bus Stop'],
    aliases: ['sundarapuram', 'sundarapuram pollachi road', 'kurichi', 'machampalayam'],
  },
  {
    id: 'podanur',
    name: 'Podanur',
    zoneName: 'South Coimbatore',
    pincode: '641023',
    lat: 10.9680,
    lng: 76.9890,
    popular: true,
    subAreas: ['Podanur Railway Junction Area', 'Chettipalayam Road', 'Rail Nagar', 'Konavaikalpalayam', 'Railway Workshop Road', 'Vellalore Road Link', 'Thiruvalluvar Nagar Podanur'],
    landmarks: ['Podanur Railway Junction', 'Southern Railway Central Workshop', 'Podanur Bus Terminus', 'Chettipalayam Road Crossing'],
    aliases: ['podanur', 'pothanur', 'konavaikalpalayam', 'rail nagar podanur'],
  },
  {
    id: 'eachanari',
    name: 'Eachanari',
    zoneName: 'South Coimbatore (Pollachi Highway)',
    pincode: '641021',
    lat: 10.9240,
    lng: 76.9850,
    popular: true,
    subAreas: ['Eachanari Temple Area', 'Karpagam University / Academy of Higher Education', 'Pollachi Main Road Highway', 'SIDCO Industrial Complex Phase 2', 'Rathinam Techzone Link', 'Sundarapuram Link'],
    landmarks: ['Arulmigu Eachanari Vinayagar Temple', 'Karpagam University', 'Rathinam College of Arts & Science / Techzone', 'Eachanari Signal'],
    aliases: ['eachanari', 'echanari', 'eachanari vinayagar temple', 'karpagam university', 'rathinam techzone'],
  },
  {
    id: 'malumichampatti',
    name: 'Malumichampatti',
    zoneName: 'South Coimbatore',
    pincode: '641021',
    lat: 10.9010,
    lng: 76.9940,
    popular: false,
    subAreas: ['Pollachi Main Road', 'Karpagam Medical College Area', 'Eachanari Link', 'Chettipalayam Link Road', 'Arisipalayam'],
    landmarks: ['Karpagam Medical College Hospital', 'Malumichampatti Bus Stop', 'Pollachi Highway Toll Plaza Link'],
    aliases: ['malumichampatti', 'malumichampatty', 'arisipalayam'],
  },
  {
    id: 'madukkarai',
    name: 'Madukkarai',
    zoneName: 'South-West Coimbatore (Palakkad Highway)',
    pincode: '641105',
    lat: 10.9020,
    lng: 76.9540,
    popular: true,
    subAreas: ['ACC Cement Factory Area', 'Palakkad Highway Bypass', 'Madukkarai Market', 'Marappalam', 'Madukkarai Railway Station', 'Kovai Pudur Bypass Link'],
    landmarks: ['ACC Cement Works Madukkarai', 'Madukkarai Railway Station', 'Palakkad Toll Plaza Area', 'Madukkarai Forest Area Link'],
    aliases: ['madukkarai', 'madhukkarai', 'acc cement', 'marappalam'],
  },
  {
    id: 'chettipalayam',
    name: 'Chettipalayam',
    zoneName: 'South-East Coimbatore',
    pincode: '641201',
    lat: 10.9120,
    lng: 77.0380,
    popular: false,
    subAreas: ['Coimbatore Golf Club Area', 'Podanur Road', 'Ring Road Link', 'Kari Motor Speedway Link', 'Orattukuppai'],
    landmarks: ['Coimbatore Golf Club', 'Kari Motor Speedway Racing Circuit', 'Chettipalayam Junction'],
    aliases: ['chettipalayam', 'chettipalayam golf club', 'kari motor speedway'],
  },
  {
    id: 'vellalore',
    name: 'Vellalore',
    zoneName: 'South-East Coimbatore',
    pincode: '641111',
    lat: 10.9720,
    lng: 77.0180,
    popular: false,
    subAreas: ['Integrated Bus Terminus Area', 'Singanallur Link Road', 'Mahalingapuram', 'Konavaikalpalayam Link', 'Nochipalayam'],
    landmarks: ['Vellalore Integrated Bus Terminus (Proposed)', 'Vellalore Panchayat Ground', 'Singanallur Lake Southern Bank'],
    aliases: ['vellalore', 'vellalor', 'mahalingapuram vellalore'],
  },
  {
    id: 'selvapuram',
    name: 'Selvapuram',
    zoneName: 'West-South Coimbatore',
    pincode: '641026',
    lat: 11.0020,
    lng: 76.9380,
    popular: true,
    subAreas: ['Perur Main Road', 'Telungupalayam', 'Shivalaya Theatre Area', 'Chokkampudur', 'Housing Board Selvapuram', 'Sivalingapuram', 'Ponnaiyarajapuram Link'],
    landmarks: ['Shivalaya Theatre', 'Selvapuram High School Ground', 'Perur Main Road Junction', 'Telungupalayam Hospital'],
    aliases: ['selvapuram', 'telungupalayam', 'chokkampudur', 'shivalaya theatre', 'ponnaiyarajapuram'],
  },
  {
    id: 'perur',
    name: 'Perur',
    zoneName: 'West Coimbatore',
    pincode: '641010',
    lat: 10.9820,
    lng: 76.9180,
    popular: true,
    subAreas: ['Pateeswarar Temple Area', 'Vedapatti Link Road', 'Siruvani Main Road', 'Chettipalayam Perur', 'Kalingarayan Kulam Area', 'Sundakamuthur Link'],
    landmarks: ['Arulmigu Perur Pateeswarar Temple', 'Noyyal River Perur Padithurai', 'Perur Tamil Kalloori', 'Perur Bus Terminus'],
    aliases: ['perur', 'perur temple', 'pateeswarar temple', 'perur padithurai'],
  },
  {
    id: 'thondamuthur',
    name: 'Thondamuthur',
    zoneName: 'Outer West Coimbatore',
    pincode: '641109',
    lat: 10.9990,
    lng: 76.8330,
    popular: true,
    subAreas: ['Siruvani Main Road', 'Isha Yoga Route', 'Narasipuram Pirivu', 'Velliangiri Hills Link', 'Viraliyur Link', 'Kulathupalayam'],
    landmarks: ['Thondamuthur Bus Stand', 'Noyyal River Basin', 'Velliangiri Foothills Approach'],
    aliases: ['thondamuthur', 'thondamuthur siruvani road', 'narasipuram'],
  },
  {
    id: 'alandurai',
    name: 'Alandurai',
    zoneName: 'Outer West Coimbatore',
    pincode: '641101',
    lat: 10.9620,
    lng: 76.7820,
    popular: true,
    subAreas: ['Siruvani Main Road', 'Isha Yoga Centre Route', 'Karunya Nagar Link', 'Poondi Velliangiri Link', 'Madhvarayapuram'],
    landmarks: ['Alandurai Bus Stand', 'Isha Yoga Centre Approach Road', 'Karunya University Link'],
    aliases: ['alandurai', 'allandurai', 'isha yoga route', 'siruvani road alandurai'],
  },

  // ─── 5. NORTHERN EXTENSIONS & PERIPHERY ───
  {
    id: 'narasimhanaickenpalayam',
    name: 'Narasimhanaickenpalayam (NSN Palayam)',
    zoneName: 'North Coimbatore (MTP Road)',
    pincode: '641031',
    lat: 11.1090,
    lng: 76.9360,
    popular: true,
    subAreas: ['MTP Road Highway', 'Balaji Nagar NSN', 'Appanaickenpalayam Link', 'Pudupalayam', 'G.K. Industrial Estate'],
    landmarks: ['NSN Palayam Bus Stop', 'MTP Highway Flyover Point', 'Balaji Nagar Entrance'],
    aliases: ['narasimhanaickenpalayam', 'nsn palayam', 'nsn palayam mtp road'],
  },
  {
    id: 'periyanaickenpalayam',
    name: 'Periyanaickenpalayam (PN Palayam North)',
    zoneName: 'North Coimbatore (MTP Road)',
    pincode: '641020',
    lat: 11.1440,
    lng: 76.9340,
    popular: true,
    subAreas: ['Ramakrishna Mission Vidyalaya Campus', 'Samichettipalayam', 'Press Colony', 'LMW Unit 1 Area', 'Teachers Colony PN Palayam North', 'Kuppepalayam'],
    landmarks: ['Sri Ramakrishna Mission Vidyalaya', 'Periyanaickenpalayam Railway Station', 'LMW Main Unit', 'Press Colony Bus Stop'],
    aliases: ['periyanaickenpalayam', 'periyanaickanpalayam', 'ramakrishna mission vidyalaya', 'press colony', 'samichettipalayam'],
  },
  {
    id: 'karamadai',
    name: 'Karamadai',
    zoneName: 'North Coimbatore / Mettupalayam Highway',
    pincode: '641104',
    lat: 11.2420,
    lng: 76.9580,
    popular: true,
    subAreas: ['Ranganathar Swamy Temple Area', 'Mettupalayam Highway', 'Teachers Colony Karamadai', 'Velliangadu Link Road', 'Bellathi Road'],
    landmarks: ['Arulmigu Karamadai Ranganathar Swamy Temple', 'Karamadai Railway Station', 'Karamadai Bus Stand'],
    aliases: ['karamadai', 'karamadai ranganathar', 'karamadai mtp road'],
  },
  {
    id: 'annur',
    name: 'Annur',
    zoneName: 'North-East Coimbatore',
    pincode: '641653',
    lat: 11.2330,
    lng: 77.1320,
    popular: true,
    subAreas: ['Sathy Road Annur', 'Kunnathur Road', 'Avinashi Link Road', 'Mettupalayam Link Road', 'Kariyampalayam', 'Othimalai Link'],
    landmarks: ['Manniswarar Temple Annur', 'Annur Bus Stand (Four Roads Junction)', 'Othimalai Murugan Temple Link'],
    aliases: ['annur', 'anoor', 'annur four roads'],
  },
  {
    id: 'karumathampatti',
    name: 'Karumathampatti',
    zoneName: 'East Coimbatore (Salem-Kochi Highway)',
    pincode: '641659',
    lat: 11.1090,
    lng: 77.1820,
    popular: true,
    subAreas: ['Avinashi Highway NH544', 'Park College of Engineering', 'Somanur Road Link', 'Kaniyur Link', 'Vittampalayam'],
    landmarks: ['Holy Rosary Basilica (Karumathampatti Church)', 'Karumathampatti Toll Plaza', 'Park Global College'],
    aliases: ['karumathampatti', 'karumathampatty', 'kaniyur', 'somanur link'],
  },
];

/**
 * Searches and ranks Coimbatore localities based on customer search query.
 * Matches across Area name, sub-localities, colonies, popular roads, landmarks, aliases, and 6-digit PIN codes.
 */
export function searchCoimbatoreLocalities(rawQuery: string): CoimbatoreSearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query || query.length < 2) return [];

  const isNumericPincode = /^\d+$/.test(query);
  const results: { item: CoimbatoreAreaItem; matchedSub?: string; score: number }[] = [];

  for (const item of COIMBATORE_MASTER_AREAS) {
    let score = 0;
    let matchedSub: string | undefined = undefined;

    const nameLower = item.name.toLowerCase();
    const pin = item.pincode;

    // 1. PIN code search
    if (isNumericPincode) {
      if (pin.startsWith(query)) {
        score += pin === query ? 100 : 70;
      }
    }

    // 2. Direct Area Name Match
    if (nameLower === query) {
      score += 120;
    } else if (nameLower.startsWith(query)) {
      score += 90;
    } else if (nameLower.includes(query)) {
      score += 60;
    }

    // 3. Aliases Match
    for (const alias of item.aliases) {
      if (alias === query) {
        score = Math.max(score, 110);
      } else if (alias.startsWith(query)) {
        score = Math.max(score, 80);
      } else if (alias.includes(query)) {
        score = Math.max(score, 50);
      }
    }

    // 4. Sub-Areas / Streets / Colonies Match
    for (const sub of item.subAreas) {
      const subLower = sub.toLowerCase();
      if (subLower === query) {
        score = Math.max(score, 95);
        matchedSub = sub;
      } else if (subLower.startsWith(query)) {
        score = Math.max(score, 75);
        matchedSub = sub;
      } else if (subLower.includes(query)) {
        score = Math.max(score, 45);
        matchedSub = sub;
      }
    }

    // 5. Landmarks Match
    for (const landmark of item.landmarks) {
      const landmarkLower = landmark.toLowerCase();
      if (landmarkLower.includes(query)) {
        score = Math.max(score, 40);
        if (!matchedSub) matchedSub = landmark;
      }
    }

    if (score > 0) {
      // Bonus for popular central hubs
      if (item.popular) score += 10;
      results.push({ item, matchedSub, score });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  // Map to unified CoimbatoreSearchResult with accurate distance & delivery fee calculation
  return results.slice(0, 15).map(({ item, matchedSub }) => {
    const distanceKm = Number(
      calculateDistanceKm(SHOP_COORDINATES.lat, SHOP_COORDINATES.lng, item.lat, item.lng).toFixed(1)
    );
    const deliveryFee = calculateCoimbatoreBikeFee(distanceKm);

    const title = matchedSub ? `${matchedSub}, ${item.name}` : item.name;
    const subtitle = `${item.zoneName}, Coimbatore - PIN: ${item.pincode} (~${distanceKm} km from store)`;

    return {
      id: item.id + (matchedSub ? `-${matchedSub.replace(/\s+/g, '_').toLowerCase()}` : ''),
      title,
      subtitle,
      areaName: item.name,
      subArea: matchedSub,
      pincode: item.pincode,
      lat: item.lat,
      lng: item.lng,
      distanceKm,
      deliveryFee,
      isPopular: Boolean(item.popular),
      displayName: `${title}, Coimbatore, Tamil Nadu ${item.pincode}`,
    };
  });
}
