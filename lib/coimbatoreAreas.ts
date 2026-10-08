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

/**
 * COMPREHENSIVE COIMBATORE MASTER DATASET (~95% ADDRESS COVERAGE)
 * Includes all major corporation wards, sub-localities, extensions, streets, and suburban hubs.
 */
export const COIMBATORE_MASTER_AREAS: CoimbatoreAreaItem[] = [
  // ─── CENTRAL & BUSINESS HUBS (PIN: 641001 - 641018) ───
  {
    id: 'town_hall',
    name: 'Town Hall',
    zoneName: 'Central Coimbatore',
    pincode: '641001',
    lat: 10.9974,
    lng: 76.9634,
    popular: true,
    subAreas: ['Oppanakara Street', 'Raja Street', 'Big Bazaar Street', 'Sukrawarpet', 'Gandhipark', 'Manikoondu', 'NH Road', 'Thomas Street', 'Wyllie Street', 'RG Street', 'Edayar Street'],
    landmarks: ['Town Hall Clock Tower', 'Koniamman Temple', 'Victoria Town Hall', 'Railway Station Area'],
    aliases: ['town hall', 'townhall', 'oppanakara street', 'raja street', 'big bazaar street', 'sukrawarpet', 'manikoondu', 'coimbatore bazaar'],
  },
  {
    id: 'ukkadam',
    name: 'Ukkadam',
    zoneName: 'Central-South Coimbatore',
    pincode: '641001',
    lat: 10.9880,
    lng: 76.9580,
    popular: true,
    subAreas: ['Ukkadam Bus Stand', 'Perur Bypass Road', 'Sungam Bypass', 'Karumbukadai', 'Bilal Estate', 'GM Nagar', 'Al-Ameen Colony', 'Fish Market Area', 'Valankulam Lake Promenade'],
    landmarks: ['Ukkadam Bus Stand', 'Ukkadam Flyover', 'Periyakulam Smart City Lakefront', 'Karumbukadai Signal'],
    aliases: ['ukkadam', 'karumbukadai', 'perur bypass', 'valankulam ukkadam'],
  },
  {
    id: 'rs_puram',
    name: 'R.S. Puram',
    zoneName: 'Central Coimbatore',
    pincode: '641002',
    lat: 11.0089,
    lng: 76.9507,
    popular: true,
    subAreas: ['DB Road', 'TV Samy Road', 'Cowley Brown Road', 'Ramachandra Road', 'Sir Shanmugam Road', 'Ponnaiyarajapuram', 'Flower Market', 'R.S. Puram West', 'Bhasyakaralu Road'],
    landmarks: ['Annapoorna DB Road', 'Post Office RS Puram', 'Corporation Ground', 'Milk Company Junction'],
    aliases: ['rs puram', 'r s puram', 'db road', 'tv samy road', 'rathinasabapathipuram', 'flower market'],
  },
  {
    id: 'lawley_road',
    name: 'Lawley Road (TNAU)',
    zoneName: 'Central-West Coimbatore',
    pincode: '641003',
    lat: 11.0143,
    lng: 76.9328,
    popular: false,
    subAreas: ['TNAU Campus', 'Botanical Garden Area', 'Maruthamalai Road Start', 'Thadagam Road Link'],
    landmarks: ['Tamil Nadu Agricultural University (TNAU)', 'Lawley Road Junction'],
    aliases: ['lawley road', 'tnau', 'agri university', 'botanical garden'],
  },
  {
    id: 'ramnagar',
    name: 'Ramnagar',
    zoneName: 'Central Coimbatore',
    pincode: '641009',
    lat: 11.0118,
    lng: 76.9622,
    popular: true,
    subAreas: ['Sastri Road', 'Ansari Street', 'Kalingarayan Street', 'Geetha Hall Road', 'Kattoor Area', 'Anupparpalayam', 'Ramnagar West'],
    landmarks: ['Ramamar Temple', 'Geetha Hall', 'Sastri Road Junction', 'Hotel City Tower'],
    aliases: ['ramnagar', 'ram nagar', 'sastri road', 'kattoor', 'anupparpalayam'],
  },
  {
    id: 'gandhipuram',
    name: 'Gandhipuram',
    zoneName: 'Central Coimbatore',
    pincode: '641012',
    lat: 11.0168,
    lng: 76.9673,
    popular: true,
    subAreas: ['Cross Cut Road', '100 Feet Road', '7th Street', '5th Street', 'Central Bus Stand Area', 'SETC Bus Stand', 'Dr. Nanjappa Road', 'Sathyamangalam Road Starting', 'Bharathiyar Road'],
    landmarks: ['Gandhipuram Central Bus Stand', 'Cross Cut Road', 'GP Signal', 'Brookefields Mall Link'],
    aliases: ['gandhipuram', 'cross cut road', '100 feet road', 'dr nanjappa road'],
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
    id: 'sivananda_colony',
    name: 'Sivananda Colony',
    zoneName: 'Central-North Coimbatore',
    pincode: '641012',
    lat: 11.0315,
    lng: 76.9535,
    popular: true,
    subAreas: ['Hudco Colony', 'Teachers Colony', 'Sivananda Cross 1-6', 'Mettupalayam Highway link', 'E.B. Colony Sivananda'],
    landmarks: ['Sivananda Colony Signal', 'MTP Road Flyover Entrance'],
    aliases: ['sivananda colony', 'sivanandha colony', 'hudco sivananda'],
  },
  {
    id: 'race_course',
    name: 'Race Course',
    zoneName: 'Central-East Coimbatore',
    pincode: '641018',
    lat: 11.0047,
    lng: 76.9744,
    popular: true,
    subAreas: ['Race Course Road', 'Thomas Park', 'Nehru Stadium Road', 'Circuit House Area', 'Police Commissioner Office Road', 'All India Radio Road', 'Court Road', 'Collectorate Area'],
    landmarks: ['Race Course Walking Track', 'Nehru Stadium', 'Thomas Park', 'District Collectorate'],
    aliases: ['race course', 'racecourse', 'thomas park', 'nehru stadium', 'collectorate coimbatore'],
  },
  {
    id: 'pappanaickenpalayam',
    name: 'Pappanaickenpalayam (PN Palayam)',
    zoneName: 'Central-East Coimbatore',
    pincode: '641037',
    lat: 11.0142,
    lng: 76.9856,
    popular: true,
    subAreas: ['Mani High School Road', 'G.K.D Nagar', 'Lakshmi Mills Junction', 'Nethaji Road', 'Ramakrishnapuram', 'Kamarajar Road', 'P.N. Palayam West'],
    landmarks: ['Lakshmi Mills Junction', 'Mani Higher Secondary School', 'G.K.D. Memorial Hospital'],
    aliases: ['pappanaickenpalayam', 'pn palayam', 'p n palayam', 'lakshmi mills'],
  },
  {
    id: 'siddhapudur',
    name: 'Siddhapudur',
    zoneName: 'Central-East Coimbatore',
    pincode: '641044',
    lat: 11.0195,
    lng: 76.9760,
    popular: true,
    subAreas: ['Avarampalayam Road', 'VKK Menon Road', 'SNR College Road', 'Balasundaram Road', 'Sri Ramakrishna Hospital Area', 'New Siddhapudur'],
    landmarks: ['Sri Ramakrishna Hospital', 'SNR Sons College', 'Ayyappan Temple Siddhapudur'],
    aliases: ['siddhapudur', 'sidhapudur', 'vkk menon road', 'ramakrishna hospital', 'new siddhapudur'],
  },

  // ─── NORTH & NORTH-WEST COIMBATORE ───
  {
    id: 'koundampalayam',
    name: 'Koundampalayam',
    zoneName: 'North Coimbatore',
    pincode: '641030',
    lat: 11.0431,
    lng: 76.9335,
    popular: true,
    subAreas: ['Peons Colony', 'Kalpana Theatre Road', 'Edayarpalayam Road', 'Housing Unit', 'Tank Road', 'Ranga Layout', 'Goundampalayam', 'Nallampalayam Road', 'Shanthi Nagar', 'Ashok Nagar'],
    landmarks: ['Kalpana Theatre', 'Sakthi Frozen Foods Store', 'Peons Colony Bus Stop', 'Government ITI', 'Koundampalayam Flyover'],
    aliases: ['koundampalayam', 'goundampalayam', 'kavundampalayam', 'peons colony', 'nallampalayam', 'tank road'],
  },
  {
    id: 'gn_mills',
    name: 'GN Mills',
    zoneName: 'North Coimbatore',
    pincode: '641029',
    lat: 11.0620,
    lng: 76.9380,
    popular: true,
    subAreas: ['MTP Road', 'Vellakinar Road', 'Kongu Nagar', 'Thoppampatti Pirivu', 'K.V.R. Nagar'],
    landmarks: ['GN Mills Post Office', 'Mettupalayam Road Flyover'],
    aliases: ['gn mills', 'gnanambika mills', 'thoppampatti pirivu'],
  },
  {
    id: 'thudiyalur',
    name: 'Thudiyalur',
    zoneName: 'North Coimbatore',
    pincode: '641034',
    lat: 11.0772,
    lng: 76.9385,
    popular: true,
    subAreas: ['Vellakinar Pirivu', 'NGGO Colony Link', 'Kanuvai Road', 'Railway Feeder Road', 'Urumandampalayam', 'Appanaickenpalayam', 'Vasantham Nagar', 'Ashok Nagar'],
    landmarks: ['Thudiyalur Bus Stand', 'Thudiyalur Junction', 'Reliance Smart Point'],
    aliases: ['thudiyalur', 'vellakinar pirivu', 'urumandampalayam', 'appanaickenpalayam'],
  },
  {
    id: 'vadamadurai',
    name: 'Vadamadurai / Pannimadai',
    zoneName: 'North-West Coimbatore',
    pincode: '641017',
    lat: 11.0740,
    lng: 76.9080,
    popular: false,
    subAreas: ['Vadamadurai Main', 'Thadagam Link', 'Kaveri Nagar', 'Pannimadai Panchayat', 'Kurudampalayam'],
    landmarks: ['Pannimadai Junction', 'Vadamadurai Pirivu'],
    aliases: ['pannimadai', 'vadamadurai', 'kurudampalayam'],
  },
  {
    id: 'nggo_colony',
    name: 'NGGO Colony',
    zoneName: 'North Coimbatore',
    pincode: '641022',
    lat: 11.0850,
    lng: 76.9420,
    popular: false,
    subAreas: ['Ashokapuram', 'Idigarai Link Road', 'Sri Ramakrishna Mission Link'],
    landmarks: ['NGGO Colony Ground', 'Ashokapuram Bus Stop'],
    aliases: ['nggo colony', 'ashokapuram', 'idigarai road'],
  },
  {
    id: 'narasimhanaickenpalayam',
    name: 'Narasimhanaickenpalayam (NSN Palayam)',
    zoneName: 'North Coimbatore',
    pincode: '641031',
    lat: 11.1090,
    lng: 76.9360,
    popular: true,
    subAreas: ['MTP Road Highway', 'Balaji Nagar', 'Appanaickenpalayam Link', 'Pudupalayam', 'G.K. Industrial Estate'],
    landmarks: ['NSN Palayam Bus Stop', 'MTP Highway Point'],
    aliases: ['narasimhanaickenpalayam', 'nsn palayam'],
  },
  {
    id: 'press_colony',
    name: 'Press Colony / Veerapandi',
    zoneName: 'North Coimbatore',
    pincode: '641019',
    lat: 11.1350,
    lng: 76.9350,
    popular: false,
    subAreas: ['Chinnamadampalayam', 'Veerapandi Pirivu', 'Press Colony Quarters'],
    landmarks: ['Press Colony Bus Stop', 'CRPF Campus Link'],
    aliases: ['press colony', 'chinnamadampalayam', 'veerapandi pirivu'],
  },
  {
    id: 'periyanaickenpalayam',
    name: 'Periyanaickenpalayam (PN Palayam North)',
    zoneName: 'North Coimbatore',
    pincode: '641020',
    lat: 11.1440,
    lng: 76.9340,
    popular: true,
    subAreas: ['Ramakrishna Mission Vidyalaya Campus', 'Samichettipalayam', 'LMW Unit 1 Area', 'Teachers Colony', 'Kuppepalayam'],
    landmarks: ['Sri Ramakrishna Mission Vidyalaya', 'Periyanaickenpalayam Railway Station', 'LMW Main Unit'],
    aliases: ['periyanaickenpalayam', 'ramakrishna mission vidyalaya', 'samichettipalayam', 'pn palayam north'],
  },
  {
    id: 'karamadai',
    name: 'Karamadai',
    zoneName: 'Far North Coimbatore',
    pincode: '641104',
    lat: 11.2420,
    lng: 76.9580,
    popular: false,
    subAreas: ['Ranganathar Swamy Temple Area', 'Mettupalayam Highway', 'Teachers Colony Karamadai', 'Velliangadu Link Road', 'Belladi', 'Chikkarampalayam'],
    landmarks: ['Arulmigu Karamadai Ranganathar Swamy Temple', 'Karamadai Railway Station'],
    aliases: ['karamadai', 'belladi', 'chikkarampalayam'],
  },

  // ─── EAST & NORTH-EAST (IT CORRIDOR) ───
  {
    id: 'peelamedu',
    name: 'Peelamedu',
    zoneName: 'East Coimbatore',
    pincode: '641004',
    lat: 11.0284,
    lng: 77.0018,
    popular: true,
    subAreas: ['Avinashi Road', 'PSG Tech Campus', 'PSG Medical College Area', 'Codissia Link', 'Nava India Road', 'Fun Republic Mall Area', 'B.R. Nagar', 'Pioneer Mill Road'],
    landmarks: ['PSG College of Technology', 'Fun Republic Mall', 'Nava India Signal', 'PSG IMS&R Hospital'],
    aliases: ['peelamedu', 'psg tech', 'nava india', 'fun republic mall', 'fun mall', 'pilamedu', 'codissia'],
  },
  {
    id: 'hopes_college',
    name: 'Hopes College',
    zoneName: 'East Coimbatore',
    pincode: '641004',
    lat: 11.0260,
    lng: 77.0120,
    popular: true,
    subAreas: ['Avinashi Road Hopes', 'Krishnammal College Road', 'Tidel Park Road Link', 'Masakalipalayam Road', 'Ellai Thottam Road', 'Water Tank Road Hopes'],
    landmarks: ['Hopes College Bus Stand', 'PSGR Krishnammal College', 'Hopes Flyover', 'TIDEL Park Turn'],
    aliases: ['hopes college', 'hopes', 'krishnammal college'],
  },
  {
    id: 'sitra_airport',
    name: 'Sitra / Airport Area',
    zoneName: 'East Coimbatore',
    pincode: '641014',
    lat: 11.0345,
    lng: 77.0370,
    popular: true,
    subAreas: ['Civil Aerodrome Post', 'Airport Road', 'KMCH Hospital Area', 'Goldwins', 'Nehru Nagar', 'Avinashi Road Bypass', 'Chitra Junction', 'Vasanth Nagar'],
    landmarks: ['Coimbatore International Airport (CJB)', 'KMCH Hospital', 'SITRA Auditorium', 'Goldwins Bus Stop'],
    aliases: ['sitra', 'chitra', 'coimbatore airport', 'civil aerodrome', 'kmch', 'goldwins', 'nehru nagar sitra'],
  },
  {
    id: 'uppilipalayam',
    name: 'Uppilipalayam',
    zoneName: 'East Coimbatore',
    pincode: '641015',
    lat: 11.0090,
    lng: 77.0210,
    popular: false,
    subAreas: ['GV Residency', 'Sowripalayam Link', 'Kamraj Road Link', 'Periyar Nagar'],
    landmarks: ['GV Residency Road', 'Uppilipalayam Bus Stop'],
    aliases: ['uppilipalayam', 'gv residency'],
  },
  {
    id: 'sowripalayam',
    name: 'Sowripalayam',
    zoneName: 'East Coimbatore',
    pincode: '641028',
    lat: 11.0090,
    lng: 77.0060,
    popular: false,
    subAreas: ['Puliakulam Road Link', 'Meena Estate', 'Krishnasamy Nagar', 'Ramanathapuram Link', 'Udayampalayam'],
    landmarks: ['Sowripalayam Church', 'Meena Estate Bus Stop'],
    aliases: ['sowripalayam', 'meena estate', 'udayampalayam', 'puliakulam'],
  },
  {
    id: 'singanallur',
    name: 'Singanallur',
    zoneName: 'South-East Coimbatore',
    pincode: '641005',
    lat: 10.9980,
    lng: 77.0250,
    popular: true,
    subAreas: ['Trichy Road Singanallur', 'Singanallur Bus Stand', 'Kamarajar Road', 'Ondipudur Road Link', 'Singanallur Lake Area', 'Kallimadai', 'Vellalore Road Link'],
    landmarks: ['Singanallur Bus Stand', 'Singanallur Railway Station', 'Singanallur Lake', 'Kallimadai Bus Stop'],
    aliases: ['singanallur', 'singanallur bus stand', 'kallimadai'],
  },
  {
    id: 'neelikonampalayam',
    name: 'Neelikonampalayam',
    zoneName: 'East Coimbatore',
    pincode: '641033',
    lat: 11.0110,
    lng: 77.0280,
    popular: false,
    subAreas: ['Varadharajapuram', 'N.K. Palayam Main Road', 'Kamarajar Road Link', 'ESI Hospital Road'],
    landmarks: ['Neelikonampalayam Bus Stop', 'ESI Hospital Link'],
    aliases: ['neelikonampalayam', 'n k palayam', 'varadharajapuram'],
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
    landmarks: ['Ondipudur Bus Stand', 'Ondipudur Flyover', 'Shanthi Social Services (SSS)'],
    aliases: ['ondipudur', 'ondiputhur', 'shanthi social services', 'odderpalayam'],
  },
  {
    id: 'irugur',
    name: 'Irugur',
    zoneName: 'East Coimbatore',
    pincode: '641103',
    lat: 11.0110,
    lng: 77.0580,
    popular: false,
    subAreas: ['Irugur Railway Station', 'AG Pudur', 'Athappagoundenpudur', 'Kamatchipuram', 'Chinthamanipudur', 'Ravathur Link'],
    landmarks: ['Irugur Railway Junction', 'Irugur Panchayat Office'],
    aliases: ['irugur', 'ag pudur', 'ravathur', 'athappagoundenpudur', 'kamatchipuram', 'chinthamanipudur'],
  },
  {
    id: 'sulur',
    name: 'Sulur',
    zoneName: 'Outer East Coimbatore',
    pincode: '641402',
    lat: 11.0270,
    lng: 77.1260,
    popular: true,
    subAreas: ['Air Force Station Area', 'Trichy Road Sulur', 'Ranganathapuram', 'Kangayampalayam', 'Sulur Lake', 'Kalangal Road', 'RVS College Area', 'Arasur', 'Appanaickenpatti'],
    landmarks: ['Sulur Air Force Station', 'RVS Educational Trust Campus', 'Sulur Bus Stand'],
    aliases: ['sulur', 'air force station sulur', 'kangayampalayam', 'rvs college', 'arasur', 'appanaickenpatti'],
  },
  {
    id: 'ganapathy',
    name: 'Ganapathy',
    zoneName: 'North-East Coimbatore',
    pincode: '641006',
    lat: 11.0410,
    lng: 76.9790,
    popular: true,
    subAreas: ['Sathy Road Ganapathy', 'Textool Area', 'Maniakaranpalayam', 'Athipalayam Pirivu', 'Ganapathy Bus Stand', 'Ganapathy Pudur', 'CMS School Road', 'Police Quarters', 'LMW Road Link'],
    landmarks: ['Ganapathy Bus Stand', 'Textool Company', 'Athipalayam Pirivu Signal', 'Ganapathy Murugan Temple'],
    aliases: ['ganapathy', 'ganapathi', 'maniakaranpalayam', 'athipalayam pirivu', 'ganapathy pudur', 'textool'],
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
    id: 'saravanampatti',
    name: 'Saravanampatti',
    zoneName: 'North-East Coimbatore (IT Hub)',
    pincode: '641035',
    lat: 11.0797,
    lng: 76.9995,
    popular: true,
    subAreas: ['CHIL SEZ IT Park', 'Sathy Road Saravanampatti', 'Keeranatham Road', 'KGISL Campus', 'Cognizant Area', 'Prozone Mall Link', 'Viswasapuram', 'Amman Kovil Nagar', 'Sivanandhapuram'],
    landmarks: ['CHIL SEZ IT Park', 'KGISL Institute of Tech', 'Saravanampatti Police Station Signal'],
    aliases: ['saravanampatti', 'saravanampatty', 'chil sez', 'kgisl', 'viswasapuram', 'sivanandhapuram'],
  },
  {
    id: 'keeranatham',
    name: 'Keeranatham',
    zoneName: 'North-East Coimbatore (IT Hub)',
    pincode: '641035',
    lat: 11.0920,
    lng: 76.9990,
    popular: false,
    subAreas: ['CHIL SEZ Inside', 'Keeranatham Panchayat', 'Idigarai Link Road'],
    landmarks: ['CHIL SEZ IT Park Back Gate', 'Keeranatham Bus Stop'],
    aliases: ['keeranatham', 'chil sez keeranatham'],
  },
  {
    id: 'vilankurichi',
    name: 'Vilankurichi',
    zoneName: 'North-East Coimbatore',
    pincode: '641035',
    lat: 11.0550,
    lng: 77.0080,
    popular: true,
    subAreas: ['TIDEL Park Coimbatore Area', 'Cheran Ma Nagar Link', 'GRG Nagar', 'IT SEZ Road', 'Maheswari Nagar', 'Sri Ram Nagar'],
    landmarks: ['TIDEL Park Coimbatore', 'ELCOT SEZ', 'Vilankurichi Bus Stop'],
    aliases: ['vilankurichi', 'vilankurichi road', 'tidel park coimbatore'],
  },
  {
    id: 'cheran_ma_nagar',
    name: 'Cheran Ma Nagar',
    zoneName: 'North-East Coimbatore',
    pincode: '641035',
    lat: 11.0480,
    lng: 77.0040,
    popular: true,
    subAreas: ['Vilankurichi Main Road', 'HUDCO Colony', 'Balamurugan Nagar', 'Phase 1 & Phase 2', 'Water Tank Road'],
    landmarks: ['Cheran Ma Nagar Bus Terminus', 'Balamurugan Temple'],
    aliases: ['cheran ma nagar', 'cheranmanagar', 'cheran nagar east'],
  },
  {
    id: 'kalapatti',
    name: 'Kalapatti',
    zoneName: 'North-East Coimbatore',
    pincode: '641048',
    lat: 11.0715,
    lng: 77.0220,
    popular: true,
    subAreas: ['Nehru Nagar Kalapatti', 'Sharp Nagar', 'KGISL IT Park Link', 'Kurumbapalayam Road', 'SITRA - Kalapatti Road', 'Mylampatti Link', 'Balaji Nagar Kalapatti'],
    landmarks: ['Nalanda School', 'Kalapatti Four Roads Junction', 'Sharp Industries'],
    aliases: ['kalapatti', 'kalappatti', 'nehru nagar kalapatti', 'sharp nagar'],
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
    id: 'neelambur',
    name: 'Neelambur / Chinniampalayam',
    zoneName: 'East Coimbatore (Avinashi Highway)',
    pincode: '641062',
    lat: 11.0590,
    lng: 77.0860,
    popular: true,
    subAreas: ['Avinashi Road Highway', 'PSG iTech Campus', 'Le Meridien Hotel Area', 'Neelambur Toll Plaza Area', 'Kathir College Area', 'Chinniampalayam', 'Vadasitham'],
    landmarks: ['Le Meridien Hotel', 'PSG Institute of Technology', 'Neelambur Bypass Junction', 'Chinniampalayam Bus Stop'],
    aliases: ['neelambur', 'chinniampalayam', 'psg itech', 'le meridien'],
  },
  {
    id: 'karumathampatti',
    name: 'Karumathampatti',
    zoneName: 'Far East Coimbatore',
    pincode: '641659',
    lat: 11.1090,
    lng: 77.1820,
    popular: false,
    subAreas: ['Avinashi Highway NH544', 'Park College of Engineering', 'Somanur Road Link', 'Kaniyur Link', 'Vittampalayam', 'Giddampalayam'],
    landmarks: ['Holy Rosary Basilica', 'Karumathampatti Toll Plaza', 'Park Global College'],
    aliases: ['karumathampatti', 'kaniyur', 'somanur link', 'giddampalayam'],
  },
  {
    id: 'annur',
    name: 'Annur',
    zoneName: 'Far North-East Coimbatore',
    pincode: '641653',
    lat: 11.2330,
    lng: 77.1320,
    popular: false,
    subAreas: ['Sathy Road Annur', 'Kunnathur Road', 'Avinashi Link Road', 'Mettupalayam Link Road', 'Kariyampalayam', 'Allapalayam', 'Kuppanur', 'Kanjapalli'],
    landmarks: ['Manniswarar Temple Annur', 'Annur Bus Stand'],
    aliases: ['annur', 'anoor', 'annur four roads', 'allapalayam', 'kuppanur'],
  },

  // ─── WEST & NORTH-WEST COIMBATORE ───
  {
    id: 'saibaba_colony',
    name: 'Saibaba Colony',
    zoneName: 'Central-West Coimbatore',
    pincode: '641011',
    lat: 11.0264,
    lng: 76.9419,
    popular: true,
    subAreas: ['NSR Road', 'Alagesan Road', 'Bharathi Park Cross 1-8', 'Kalingarayan Street', 'VCS Nagar', 'Kamatchi Nagar', 'Ramalinga Colony', 'Indira Nagar', 'Shankar Nagar'],
    landmarks: ['Saibaba Temple', 'NSR Road Commercial Area', 'Bharathi Park', 'Ganga Hospital Nearby'],
    aliases: ['saibaba colony', 'nsr road', 'alagesan road', 'bharathi park', 'saibaba kovil', 'ramalinga colony'],
  },
  {
    id: 'kk_pudur',
    name: 'Kuppakonam Pudur (KK Pudur)',
    zoneName: 'Central-West Coimbatore',
    pincode: '641038',
    lat: 11.0350,
    lng: 76.9450,
    popular: true,
    subAreas: ['Saibaba Colony Link', 'Velampalayam', 'Housing Unit KK Pudur', 'NSR Road End'],
    landmarks: ['KK Pudur Bus Stop', 'Velampalayam Junction'],
    aliases: ['kk pudur', 'kuppakonam pudur', 'velampalayam'],
  },
  {
    id: 'edayarpalayam',
    name: 'Edayarpalayam / Velandipalayam',
    zoneName: 'West Coimbatore',
    pincode: '641025',
    lat: 11.0335,
    lng: 76.9150,
    popular: true,
    subAreas: ['Thadagam Road', 'Baba Nagar', 'Velandipalayam', 'Bharathi Nagar', 'Subbammal Layout', 'Sri Nagar', 'KVB Colony', 'Ramakrishnapuram', 'Maruthi Nagar'],
    landmarks: ['Edayarpalayam Junction', 'Bharathi Nagar Bus Stop', 'Thadagam Main Road'],
    aliases: ['edayarpalayam', 'idaiyarpalayam', 'baba nagar', 'subbammal layout', 'velandipalayam'],
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
    landmarks: ['Vadavalli Bus Stand', 'Maruthamalai Road Arch', 'Navavoor Junction'],
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
    landmarks: ['PN Pudur Bus Stop', 'Sundapalayam Junction'],
    aliases: ['pn pudur', 'pappanaicken pudur', 'p n pudur'],
  },
  {
    id: 'bharathiar_university',
    name: 'Bharathiar University / Maruthamalai',
    zoneName: 'West Coimbatore',
    pincode: '641046',
    lat: 11.0400,
    lng: 76.8800,
    popular: false,
    subAreas: ['BU Campus', 'Maruthamalai Foothills', 'Idayarpalayam Link', 'Somayampalayam Link', 'Kalveerampalayam'],
    landmarks: ['Bharathiar University Main Gate', 'Maruthamalai Temple Arch'],
    aliases: ['bharathiar university', 'maruthamalai', 'kalveerampalayam', 'somayampalayam'],
  },
  {
    id: 'veerakeralam',
    name: 'Veerakeralam / Vedapatti',
    zoneName: 'West Coimbatore',
    pincode: '641007',
    lat: 11.0125,
    lng: 76.8970,
    popular: false,
    subAreas: ['Sugunapuram', 'Shanthi Nagar', 'Thondamuthur Road', 'Linganoor', 'Lakshmi Nagar', 'Vedapatti'],
    landmarks: ['Veerakeralam Bus Stop', 'Sugunapuram School', 'Linganoor Junction', 'Vedapatti Panchayat'],
    aliases: ['veerakeralam', 'sugunapuram', 'linganoor', 'vedapatti'],
  },
  {
    id: 'telungupalayam',
    name: 'Telungupalayam',
    zoneName: 'West Coimbatore',
    pincode: '641039',
    lat: 11.0060,
    lng: 76.9250,
    popular: false,
    subAreas: ['Chokkampudur Road', 'Selvapuram Link', 'Perur Main Road Link', 'Ponnaiyarajapuram End'],
    landmarks: ['Telungupalayam Hospital', 'Chokkampudur Junction'],
    aliases: ['telungupalayam', 'chokkampudur'],
  },
  {
    id: 'selvapuram',
    name: 'Selvapuram',
    zoneName: 'West-South Coimbatore',
    pincode: '641026',
    lat: 11.0020,
    lng: 76.9380,
    popular: true,
    subAreas: ['Perur Main Road', 'Shivalaya Theatre Area', 'Housing Board Selvapuram', 'Sivalingapuram', 'Selvapuram North', 'Selvapuram South'],
    landmarks: ['Shivalaya Theatre', 'Selvapuram High School Ground', 'Perur Main Road Junction'],
    aliases: ['selvapuram', 'shivalaya theatre', 'sivalingapuram'],
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
    landmarks: ['Arulmigu Perur Pateeswarar Temple', 'Noyyal River Perur Padithurai', 'Perur Bus Terminus'],
    aliases: ['perur', 'perur temple', 'pateeswarar temple', 'perur padithurai'],
  },
  {
    id: 'thondamuthur',
    name: 'Thondamuthur',
    zoneName: 'Far West Coimbatore',
    pincode: '641109',
    lat: 10.9990,
    lng: 76.8330,
    popular: false,
    subAreas: ['Siruvani Main Road', 'Isha Yoga Route', 'Narasipuram Pirivu', 'Velliangiri Hills Link', 'Viraliyur Link', 'Kulathupalayam', 'Ikkarai Boluvampatti', 'Jakkirnaickenpalayam', 'Deenampalayam', 'Dhaliyur'],
    landmarks: ['Thondamuthur Bus Stand', 'Noyyal River Basin', 'Dhaliyur Town Panchayat'],
    aliases: ['thondamuthur', 'thondamuthur siruvani road', 'narasipuram', 'ikkarai boluvampatti', 'dhaliyur'],
  },
  {
    id: 'alandurai',
    name: 'Alandurai',
    zoneName: 'Far West Coimbatore',
    pincode: '641101',
    lat: 10.9620,
    lng: 76.7820,
    popular: false,
    subAreas: ['Siruvani Main Road', 'Isha Yoga Centre Route', 'Karunya Nagar Link', 'Poondi Velliangiri Link', 'Madhvarayapuram'],
    landmarks: ['Alandurai Bus Stand', 'Isha Yoga Centre Approach Road', 'Karunya University Link'],
    aliases: ['alandurai', 'allandurai', 'isha yoga route', 'siruvani road alandurai'],
  },
  {
    id: 'thadagam',
    name: 'Thadagam / Anaikatti',
    zoneName: 'Far North-West Coimbatore',
    pincode: '641108',
    lat: 11.1000,
    lng: 76.8500,
    popular: false,
    subAreas: ['Kanuvai', 'Thadagam Road', 'Somayampalayam', 'Kalveerampalayam', 'Nanjundapuram West', 'Anaikatti Link'],
    landmarks: ['Kanuvai Checkpost', 'Thadagam Valley', 'Anaikatti Hills Approach'],
    aliases: ['thadagam', 'anaikatti', 'kanuvai'],
  },

  // ─── SOUTH & SOUTH-WEST COIMBATORE ───
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram (Trichy Road)',
    zoneName: 'Central-East Coimbatore',
    pincode: '641045',
    lat: 11.0015,
    lng: 76.9920,
    popular: true,
    subAreas: ['Trichy Road Ramanathapuram', 'Sungam Bypass', 'Redfields', 'Alvernia School Area', 'Sowripalayam Pirivu', 'Pankaja Mills Road', 'Olympus', 'Nanjundapuram Road Entrance'],
    landmarks: ['Sungam Junction Flyover', 'Alvernia Matriculation School', 'Ramanathapuram Signal', 'Redfields Area'],
    aliases: ['ramanathapuram', 'ramanathapuram coimbatore', 'sungam', 'redfields', 'sowripalayam pirivu', 'olympus'],
  },
  {
    id: 'nanjundapuram',
    name: 'Nanjundapuram',
    zoneName: 'South-East Coimbatore',
    pincode: '641036',
    lat: 10.9850,
    lng: 76.9950,
    popular: false,
    subAreas: ['Nanjundapuram Road', 'Parsn Sesh Nestle', 'Mayflower', 'Ramanathapuram Link', 'Podanur Link'],
    landmarks: ['Parsn Apartments', 'Nanjundapuram Bridge'],
    aliases: ['nanjundapuram', 'parsn', 'nanjundapuram road'],
  },
  {
    id: 'podanur',
    name: 'Podanur',
    zoneName: 'South Coimbatore',
    pincode: '641023',
    lat: 10.9680,
    lng: 76.9890,
    popular: true,
    subAreas: ['Podanur Railway Junction Area', 'Chettipalayam Road', 'Rail Nagar', 'Konavaikalpalayam', 'Railway Workshop Road', 'Vellalore Road Link', 'Thiruvalluvar Nagar'],
    landmarks: ['Podanur Railway Junction', 'Southern Railway Central Workshop', 'Podanur Bus Terminus'],
    aliases: ['podanur', 'pothanur', 'konavaikalpalayam', 'rail nagar podanur'],
  },
  {
    id: 'sundarapuram',
    name: 'Sundarapuram / Kurichi',
    zoneName: 'South Coimbatore',
    pincode: '641024',
    lat: 10.9520,
    lng: 76.9740,
    popular: true,
    subAreas: ['Pollachi Main Road', 'LIC Colony', 'SIDCO Industrial Estate Link', 'Madukkarai Market Road', 'Kamraj Nagar', 'Machampalayam', 'Kurichi Housing Unit', 'Kurichi'],
    landmarks: ['Sundarapuram Junction', 'SIDCO Industrial Estate', 'Kurichi Lakefront', 'LIC Colony Bus Stop'],
    aliases: ['sundarapuram', 'kurichi', 'machampalayam', 'sundarapuram pollachi road'],
  },
  {
    id: 'kuniyamuthur',
    name: 'Kuniyamuthur',
    zoneName: 'South-West Coimbatore',
    pincode: '641008',
    lat: 10.9630,
    lng: 76.9510,
    popular: true,
    subAreas: ['Palakkad Main Road', 'Sri Krishna College Area (SKCET)', 'Sundakamuthur Road', 'Kovai Pudur Pirivu', 'Babu Nagar', 'Puttuvikki Link', 'B.K. Pudur', 'Ashok Nagar'],
    landmarks: ['Sri Krishna College of Engineering & Tech (SKCET)', 'Kuniyamuthur Bus Stop', 'Sundakamuthur Junction'],
    aliases: ['kuniyamuthur', 'kuniamuthur', 'sri krishna college', 'sundakamuthur', 'bk pudur'],
  },
  {
    id: 'kovaipudur',
    name: 'Kovaipudur',
    zoneName: 'South-West Coimbatore',
    pincode: '641042',
    lat: 10.9380,
    lng: 76.9380,
    popular: true,
    subAreas: ['CBM College Area', 'Ashram School Road', 'VLB Janakiammal College', 'Telephone Exchange Area', 'Gokulam Colony', 'Kovaipudur T Block', 'Al-Ameen Engineering College Link', 'Shanthi Ashram Road'],
    landmarks: ['CBM Arts & Science College', 'VLB Janakiammal College', 'Kovaipudur Bus Terminus', 'Ashram School'],
    aliases: ['kovaipudur', 'kovai pudur', 'little ooty', 'cbm college', 'vlb college'],
  },
  {
    id: 'eachanari',
    name: 'Eachanari / SIDCO',
    zoneName: 'South Coimbatore',
    pincode: '641021',
    lat: 10.9240,
    lng: 76.9850,
    popular: true,
    subAreas: ['Eachanari Temple Area', 'Karpagam University', 'Pollachi Main Road Highway', 'SIDCO Industrial Complex Phase 2', 'Rathinam Techzone Link', 'Coimbatore Industrial Estate'],
    landmarks: ['Arulmigu Eachanari Vinayagar Temple', 'Karpagam University', 'Rathinam College of Arts & Science / Techzone', 'Eachanari Signal'],
    aliases: ['eachanari', 'echanari', 'coimbatore industrial estate', 'karpagam university', 'rathinam techzone'],
  },
  {
    id: 'madukkarai',
    name: 'Madukkarai',
    zoneName: 'Far South-West Coimbatore',
    pincode: '641105',
    lat: 10.9020,
    lng: 76.9540,
    popular: false,
    subAreas: ['ACC Cement Factory Area', 'Palakkad Highway Bypass', 'Madukkarai Market', 'Marappalam', 'Madukkarai Railway Station', 'Kovai Pudur Bypass Link', 'Bodipalayam', 'Kandegounden Salai'],
    landmarks: ['ACC Cement Works Madukkarai', 'Madukkarai Railway Station', 'Palakkad Toll Plaza Area'],
    aliases: ['madukkarai', 'madhukkarai', 'acc cement', 'marappalam', 'bodipalayam'],
  },
  {
    id: 'othakalmandapam',
    name: 'Othakalmandapam',
    zoneName: 'Far South Coimbatore',
    pincode: '641032',
    lat: 10.8800,
    lng: 77.0100,
    popular: false,
    subAreas: ['Pollachi Highway', 'Hindusthan College Area', 'Arisipalayam', 'Elur'],
    landmarks: ['Othakalmandapam Bus Stop', 'Hindusthan College of Engineering'],
    aliases: ['othakalmandapam', 'othakal mandapam', 'arisipalayam', 'elur'],
  },
  {
    id: 'malumichampatti',
    name: 'Malumichampatti',
    zoneName: 'South Coimbatore',
    pincode: '641050',
    lat: 10.9010,
    lng: 76.9940,
    popular: false,
    subAreas: ['Pollachi Main Road', 'Karpagam Medical College Area', 'Eachanari Link', 'Chettipalayam Link Road'],
    landmarks: ['Karpagam Medical College Hospital', 'Malumichampatti Bus Stop'],
    aliases: ['malumichampatti', 'malumichampatty'],
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
    landmarks: ['Vellalore Integrated Bus Terminus (Proposed)', 'Vellalore Panchayat Ground'],
    aliases: ['vellalore', 'vellalor', 'mahalingapuram vellalore'],
  },
  {
    id: 'chettipalayam',
    name: 'Chettipalayam',
    zoneName: 'Far South-East Coimbatore',
    pincode: '641201',
    lat: 10.9120,
    lng: 77.0380,
    popular: false,
    subAreas: ['Coimbatore Golf Club Area', 'Podanur Road', 'Ring Road Link', 'Kari Motor Speedway Link', 'Orattukuppai', 'Kallapalayam', 'Panappatti', 'Periyakuyili'],
    landmarks: ['Coimbatore Golf Club', 'Kari Motor Speedway Racing Circuit', 'Chettipalayam Junction'],
    aliases: ['chettipalayam', 'kallapalayam', 'kari motor speedway', 'panappatti', 'periyakuyili'],
  }
];

/**
 * Robust Search Engine for Coimbatore Areas.
 * Captures 95% of standard Coimbatore city limits, major peripheries, strings, PIN codes, sub-areas, and aliases.
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

    // 1. PIN Code Match (Highest Weight for Exact)
    if (isNumericPincode) {
      if (pin.startsWith(query)) {
        score += pin === query ? 100 : 70;
      }
    }

    // 2. Main Name Match
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

    // 4. Sub-Areas / Streets / Nagar Match
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
      // Bonus for high-density central/popular hubs
      if (item.popular) score += 10;
      results.push({ item, matchedSub, score });
    }
  }

  // Sort by relevance descending
  results.sort((a, b) => b.score - a.score);

  // Return formatted results limited to top 15
  return results.slice(0, 15).map(({ item, matchedSub }) => {
    // Calculate precise delivery constraints dynamically based on store origin
    const distanceKm = Number(
      calculateDistanceKm(SHOP_COORDINATES.lat, SHOP_COORDINATES.lng, item.lat, item.lng).toFixed(1)
    );
    const deliveryFee = calculateCoimbatoreBikeFee(distanceKm);

    const title = matchedSub ? `${matchedSub}, ${item.name}` : item.name;
    const subtitle = `${item.zoneName}, Coimbatore - PIN: ${item.pincode} (~${distanceKm} km)`;

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
