-- ============================================================
-- Shark Attack Analytics — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Named Zones
INSERT INTO named_zones (name, country, description, latitude, longitude, known_species, peak_season_start, peak_season_end, total_attacks, fatal_attacks, safety_notes) VALUES

(
  'Red Triangle',
  'USA',
  'A region of the Pacific Ocean off the Northern California coast, stretching from Bodega Bay to Año Nuevo Island and out to the Farallon Islands. Home to one of the highest densities of great white sharks on Earth, sustained by large elephant seal and California sea lion populations.',
  37.50,
  -122.80,
  ARRAY['Great White Shark (Carcharodon carcharias)'],
  'August',
  'November',
  183,
  14,
  'Peak great white activity runs August–November when juvenile elephant seals enter the water. Avoid swimming at dawn and dusk near seal haul-out sites, especially the Farallon Islands and Año Nuevo State Park. Do not enter the water in areas with high seal or sea lion activity. Bright wetsuits and dark water create silhouette contrast — consider color carefully.'
),

(
  'Shark Alley',
  'South Africa',
  'The narrow channel between Dyer Island and Geyser Rock near Gansbaai, Western Cape. Hosts one of the densest known concentrations of adult great white sharks globally, sustained by over 60,000 Cape fur seals on Geyser Rock. Associated with spectacular predatory breaching behavior. Primarily accessed via cage diving.',
  -34.58,
  19.36,
  ARRAY['Great White Shark (Carcharodon carcharias)'],
  'May',
  'September',
  12,
  2,
  'Recreational swimming in or near Shark Alley is strongly inadvisable. Great whites in this zone are highly active apex predators targeting seals year-round with peak activity in austral winter. If visiting Gansbaai beaches, swim only at patrolled beaches far from seal colonies. Never swim at dawn or dusk.'
),

(
  'Western Australia Coast',
  'Australia',
  'The coastline of Western Australia from Coral Bay in the north to Albany in the south. Experienced a sharp rise in shark attacks from 2010 onward. Southern waters host great whites drawn to large Australian sea lion colonies; northern tropical waters host tiger sharks and bull sharks. WA has one of the highest per-capita fatal attack rates in the world.',
  -31.95,
  115.86,
  ARRAY['Great White Shark (Carcharodon carcharias)', 'Tiger Shark (Galeocerdo cuvier)', 'Bull Shark (Carcharhinus leucas)'],
  'April',
  'October',
  87,
  19,
  'Check the Shark Monitoring Network (SharkSmart app) before entering the water — WA operates an extensive network of SMART drumlines and listening stations. Avoid swimming or surfing at dawn, dusk, or night. Rockingham and Esperance areas have high fur seal populations. Northern beaches near Exmouth carry year-round tiger shark risk. Heed all shark alerts and flag patrols.'
),

(
  'Reunion Island',
  'France',
  'A French overseas territory in the Indian Ocean. Has experienced an exceptionally severe rate of fatal shark attacks since 2011, attributed to a resident bull shark population in lagoon transition zones combined with active surfing and water sports culture. Swimming and surfing outside protected lagoons has been officially restricted across much of the island.',
  -21.13,
  55.53,
  ARRAY['Bull Shark (Carcharhinus leucas)', 'Tiger Shark (Galeocerdo cuvier)'],
  'November',
  'April',
  51,
  26,
  'Reunion Island carries one of the highest per-capita fatal shark attack rates in modern records. Only swim at officially supervised and protected lagoon beaches (Saint-Gilles lagoon, Boucan Canot). The Vigihaie alert system issues real-time shark warnings — check it before any water activity. Surfing outside protected zones is prohibited in many areas. Bull sharks here are year-round residents, not seasonal migrants.'
),

(
  'Recife Beach',
  'Brazil',
  'A stretch of urban beaches near Recife, Pernambuco, northeastern Brazil. One of the most dangerous shark attack zones in the world by fatality rate. Historically attributed to bull sharks displaced by port and marina construction in the 1980s which disrupted breeding habitats in the Jaboatão and Capibaribe river estuaries. Murky warm water, high surf, and poverty-driven beach use contribute to risk.',
  -8.07,
  -34.93,
  ARRAY['Bull Shark (Carcharhinus leucas)', 'Tiger Shark (Galeocerdo cuvier)'],
  'January',
  'May',
  67,
  27,
  'Several Recife beaches are officially designated high-risk zones. Swimming beyond knee depth is strongly discouraged at Boa Viagem, Candeias, and Piedade beaches. January–May rainy season increases river runoff, turbidity, and shark proximity. The bull shark population is resident year-round. Do not swim near river mouths, port areas, or offshore fishing boats. Bait and blood in the water are persistent risk factors from nearby fishing activity.'
),

(
  'New Smyrna Beach',
  'USA',
  'A barrier island beach in Volusia County, Florida. Holds the highest recorded cumulative shark bite count of any location in the world, driven by blacktip and spinner shark migrations through the New Smyrna Inlet, large baitfish schools, and high surf density. The vast majority of incidents are investigatory bites — fatalities are extremely rare. Often cited as evidence that shark bite risk is highly local and species-dependent.',
  29.03,
  -80.93,
  ARRAY['Blacktip Shark (Carcharhinus limbatus)', 'Spinner Shark (Carcharhinus brevipinna)', 'Bull Shark (Carcharhinus leucas)'],
  'June',
  'October',
  247,
  1,
  'New Smyrna Beach has the world''s highest bite count but near-zero fatality rate — most bites are quick investigatory contacts from blacktip sharks targeting baitfish, not humans. Avoid swimming near the New Smyrna Inlet, active fishing piers, or visible baitfish schools. Shuffle feet when wading to avoid startling sharks. Avoid wearing shiny jewelry. Most bites occur on hands and feet during surf activity at dawn and dusk during summer blacktip migration.'
);


-- ============================================================
-- Shark Migration Data
-- ============================================================

-- Great White Shark — Northern California / Red Triangle
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Great White Shark', 'Northern California / Red Triangle', 1, 'medium', 'low', 'Many sharks offshore in winter; some adults remain near coast'),
('Great White Shark', 'Northern California / Red Triangle', 2, 'low', 'low', 'Offshore migration — reduced coastal presence'),
('Great White Shark', 'Northern California / Red Triangle', 3, 'low', 'low', 'Low nearshore activity'),
('Great White Shark', 'Northern California / Red Triangle', 4, 'medium', 'low', 'Beginning coastal return with early pinnipeds'),
('Great White Shark', 'Northern California / Red Triangle', 5, 'medium', 'medium', 'Presence increasing as sea lions and seals pup'),
('Great White Shark', 'Northern California / Red Triangle', 6, 'medium', 'medium', 'Moderate activity building toward season'),
('Great White Shark', 'Northern California / Red Triangle', 7, 'high', 'medium', 'Season opening — pup seals entering water increase prey availability'),
('Great White Shark', 'Northern California / Red Triangle', 8, 'high', 'high', 'Juvenile elephant seals arriving — predation escalating'),
('Great White Shark', 'Northern California / Red Triangle', 9, 'high', 'high', 'Peak month — highest predation activity and human incident risk'),
('Great White Shark', 'Northern California / Red Triangle', 10, 'high', 'high', 'Sustained peak; adult seals in water'),
('Great White Shark', 'Northern California / Red Triangle', 11, 'high', 'medium', 'Activity beginning to taper as seal numbers decrease'),
('Great White Shark', 'Northern California / Red Triangle', 12, 'medium', 'medium', 'Declining toward winter offshore migration');

-- Great White Shark — South Africa / Western Cape
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Great White Shark', 'South Africa / Western Cape', 1, 'low', 'low', 'Austral summer — many sharks offshore during fur seal pupping'),
('Great White Shark', 'South Africa / Western Cape', 2, 'low', 'low', 'Summer minimum nearshore'),
('Great White Shark', 'South Africa / Western Cape', 3, 'medium', 'low', 'Sharks beginning coastal return'),
('Great White Shark', 'South Africa / Western Cape', 4, 'medium', 'medium', 'Pre-winter increase; fur seal sub-adults in water'),
('Great White Shark', 'South Africa / Western Cape', 5, 'high', 'high', 'Austral winter onset — Cape fur seal numbers peak; great whites highly active'),
('Great White Shark', 'South Africa / Western Cape', 6, 'high', 'high', 'Peak winter — spectacular breaching predation common at Seal Island'),
('Great White Shark', 'South Africa / Western Cape', 7, 'high', 'high', 'Highest annual presence and feeding density'),
('Great White Shark', 'South Africa / Western Cape', 8, 'high', 'high', 'Continued peak activity'),
('Great White Shark', 'South Africa / Western Cape', 9, 'high', 'medium', 'Late season — activity beginning to taper'),
('Great White Shark', 'South Africa / Western Cape', 10, 'medium', 'medium', 'Decreasing as sharks begin offshore migration'),
('Great White Shark', 'South Africa / Western Cape', 11, 'medium', 'low', 'Partial migration offshore'),
('Great White Shark', 'South Africa / Western Cape', 12, 'low', 'low', 'Summer — low inshore presence');

-- Great White Shark — Western Australia
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Great White Shark', 'Western Australia', 1, 'low', 'low', 'Summer — reduced southern WA coastal presence'),
('Great White Shark', 'Western Australia', 2, 'low', 'low', 'Continued summer low'),
('Great White Shark', 'Western Australia', 3, 'medium', 'low', 'Water cooling; sharks returning to coast'),
('Great White Shark', 'Western Australia', 4, 'high', 'high', 'Autumn peak begins — sea lions and fur seals active'),
('Great White Shark', 'Western Australia', 5, 'high', 'high', 'High activity continues into austral winter'),
('Great White Shark', 'Western Australia', 6, 'high', 'high', 'Winter peak for southern WA great whites'),
('Great White Shark', 'Western Australia', 7, 'high', 'high', 'Peak presence — Esperance and Albany coastline highest risk'),
('Great White Shark', 'Western Australia', 8, 'high', 'medium', 'Sustained activity'),
('Great White Shark', 'Western Australia', 9, 'high', 'medium', 'Early spring still elevated'),
('Great White Shark', 'Western Australia', 10, 'medium', 'medium', 'Declining as water warms in south'),
('Great White Shark', 'Western Australia', 11, 'medium', 'low', 'Reduced summer presence'),
('Great White Shark', 'Western Australia', 12, 'low', 'low', 'Summer minimum in southern waters');

-- Bull Shark — Florida / Southeast USA
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Bull Shark', 'Florida / Southeast USA', 1, 'low', 'low', 'Winter — bulls in deeper offshore water; minimal nearshore'),
('Bull Shark', 'Florida / Southeast USA', 2, 'low', 'low', 'Continued winter minimum'),
('Bull Shark', 'Florida / Southeast USA', 3, 'low', 'low', 'Water still cool; low inshore activity'),
('Bull Shark', 'Florida / Southeast USA', 4, 'medium', 'low', 'Bulls returning to inshore as water warms past 22°C'),
('Bull Shark', 'Florida / Southeast USA', 5, 'medium', 'medium', 'Increasing nearshore activity — estuaries and river mouths'),
('Bull Shark', 'Florida / Southeast USA', 6, 'high', 'high', 'Summer peak begins — warm shallow water brings bulls close to shore'),
('Bull Shark', 'Florida / Southeast USA', 7, 'high', 'high', 'Peak season — highest attack risk; juveniles in estuaries'),
('Bull Shark', 'Florida / Southeast USA', 8, 'high', 'high', 'Sustained peak; river mouths and lagoons highly active'),
('Bull Shark', 'Florida / Southeast USA', 9, 'high', 'high', 'Continued high risk into autumn'),
('Bull Shark', 'Florida / Southeast USA', 10, 'medium', 'medium', 'Tapering with declining water temperature'),
('Bull Shark', 'Florida / Southeast USA', 11, 'medium', 'low', 'Reducing as water cools below 22°C'),
('Bull Shark', 'Florida / Southeast USA', 12, 'low', 'low', 'Winter departure to deeper/warmer water');

-- Bull Shark — Brazil / Recife
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Bull Shark', 'Brazil / Recife', 1, 'high', 'high', 'Rainy season onset — turbid estuarine water; highest historical attack risk'),
('Bull Shark', 'Brazil / Recife', 2, 'high', 'high', 'Continued peak — murky water and high river flow'),
('Bull Shark', 'Brazil / Recife', 3, 'high', 'high', 'Peak rainy season — historically highest attack months'),
('Bull Shark', 'Brazil / Recife', 4, 'high', 'high', 'Continued rainy season; bull sharks pushed close to beaches'),
('Bull Shark', 'Brazil / Recife', 5, 'high', 'medium', 'Transitioning from wet season; risk remains elevated'),
('Bull Shark', 'Brazil / Recife', 6, 'medium', 'medium', 'Dry season — water clarity improves slightly, activity moderate'),
('Bull Shark', 'Brazil / Recife', 7, 'medium', 'medium', 'Dry season mid-point; population remains resident year-round'),
('Bull Shark', 'Brazil / Recife', 8, 'medium', 'medium', 'Moderate activity; resident population stable'),
('Bull Shark', 'Brazil / Recife', 9, 'medium', 'medium', 'Pre-wet season; activity beginning to build'),
('Bull Shark', 'Brazil / Recife', 10, 'medium', 'high', 'Approaching wet season — feeding activity increasing'),
('Bull Shark', 'Brazil / Recife', 11, 'high', 'high', 'Rainy season returns — risk escalating sharply'),
('Bull Shark', 'Brazil / Recife', 12, 'high', 'high', 'Wet season established — peak risk returning');

-- Bull Shark — Reunion Island
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Bull Shark', 'Reunion Island', 1, 'high', 'high', 'Austral summer — resident bulls highly active in warm water'),
('Bull Shark', 'Reunion Island', 2, 'high', 'high', 'Continued peak summer activity'),
('Bull Shark', 'Reunion Island', 3, 'high', 'high', 'Late summer — still high activity'),
('Bull Shark', 'Reunion Island', 4, 'high', 'medium', 'Transitioning seasons; bulls remain present year-round'),
('Bull Shark', 'Reunion Island', 5, 'medium', 'medium', 'Cooling water; moderate activity'),
('Bull Shark', 'Reunion Island', 6, 'medium', 'medium', 'Austral winter — resident population remains active'),
('Bull Shark', 'Reunion Island', 7, 'medium', 'medium', 'Year-round resident — never fully absent'),
('Bull Shark', 'Reunion Island', 8, 'medium', 'medium', 'Moderate winter activity'),
('Bull Shark', 'Reunion Island', 9, 'medium', 'medium', 'Warming toward spring'),
('Bull Shark', 'Reunion Island', 10, 'high', 'medium', 'Spring — activity increasing with water temperature'),
('Bull Shark', 'Reunion Island', 11, 'high', 'high', 'Pre-summer peak building'),
('Bull Shark', 'Reunion Island', 12, 'high', 'high', 'Summer peak — highest attack risk of year');

-- Tiger Shark — Hawaii
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Tiger Shark', 'Hawaii', 1, 'medium', 'medium', 'Year-round resident; moderate winter activity'),
('Tiger Shark', 'Hawaii', 2, 'medium', 'medium', 'Consistent presence'),
('Tiger Shark', 'Hawaii', 3, 'medium', 'medium', 'Stable year-round population'),
('Tiger Shark', 'Hawaii', 4, 'medium', 'medium', 'Increasing slightly with warming water'),
('Tiger Shark', 'Hawaii', 5, 'high', 'medium', 'Summer season approaching — activity rising'),
('Tiger Shark', 'Hawaii', 6, 'high', 'high', 'Summer peak — highest attack risk; humpback whale calves in water'),
('Tiger Shark', 'Hawaii', 7, 'high', 'high', 'Peak activity month for Hawaiian tiger sharks'),
('Tiger Shark', 'Hawaii', 8, 'high', 'high', 'Sustained peak; warm shallow water activity'),
('Tiger Shark', 'Hawaii', 9, 'high', 'high', 'Continued high season'),
('Tiger Shark', 'Hawaii', 10, 'high', 'medium', 'Late season activity'),
('Tiger Shark', 'Hawaii', 11, 'medium', 'medium', 'Declining toward winter'),
('Tiger Shark', 'Hawaii', 12, 'medium', 'medium', 'Winter — moderate consistent presence');

-- Tiger Shark — Western Australia (northern tropical waters)
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Tiger Shark', 'Western Australia', 1, 'high', 'high', 'Tropical summer — northern WA tiger sharks at peak in warm shallow water'),
('Tiger Shark', 'Western Australia', 2, 'high', 'high', 'Continued summer peak in north (Exmouth, Ningaloo)'),
('Tiger Shark', 'Western Australia', 3, 'high', 'medium', 'Transitioning seasons in tropical zone'),
('Tiger Shark', 'Western Australia', 4, 'medium', 'medium', 'Moderate activity'),
('Tiger Shark', 'Western Australia', 5, 'medium', 'low', 'Cooling water reduces activity'),
('Tiger Shark', 'Western Australia', 6, 'low', 'low', 'Winter low in southern WA; some presence in tropical north'),
('Tiger Shark', 'Western Australia', 7, 'low', 'low', 'Minimal southern presence; moderate in northern tropics'),
('Tiger Shark', 'Western Australia', 8, 'low', 'low', 'Continued low in south'),
('Tiger Shark', 'Western Australia', 9, 'medium', 'low', 'Spring warmup — activity beginning to build'),
('Tiger Shark', 'Western Australia', 10, 'medium', 'medium', 'Pre-summer increase'),
('Tiger Shark', 'Western Australia', 11, 'high', 'high', 'Early summer — tropical north activity escalating'),
('Tiger Shark', 'Western Australia', 12, 'high', 'high', 'Summer peak approaching in northern waters');

-- Oceanic Whitetip — Red Sea / Indian Ocean
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 1, 'high', 'medium', 'Warm year-round Red Sea temperatures maintain consistent presence'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 2, 'high', 'medium', 'Active diving season — elevated human-shark contact risk'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 3, 'high', 'medium', 'Stable presence'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 4, 'high', 'medium', 'Warm waters sustain year-round population'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 5, 'high', 'high', 'Pre-summer increase in open-water feeding activity'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 6, 'high', 'high', 'Summer peak — tourist diving season coincides with elevated activity'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 7, 'high', 'high', 'Peak summer; Sharm el-Sheikh area historically highest risk'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 8, 'high', 'high', 'Sustained summer peak'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 9, 'high', 'medium', 'Late summer — still highly active'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 10, 'medium', 'medium', 'Autumn tapering'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 11, 'medium', 'medium', 'Moderate activity through autumn'),
('Oceanic Whitetip', 'Red Sea / Indian Ocean', 12, 'high', 'medium', 'Winter tourist season — diving risk remains elevated');

-- Oceanic Whitetip — Tropical Pacific / Open Ocean
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 1, 'medium', 'medium', 'Southern hemisphere summer — moderate open-ocean presence'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 2, 'medium', 'medium', 'Consistent tropical presence'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 3, 'medium', 'medium', 'Stable moderate levels'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 4, 'medium', 'medium', 'Pre-peak buildup'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 5, 'high', 'high', 'Northern hemisphere summer approaching — activity rising'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 6, 'high', 'high', 'Peak open-ocean activity'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 7, 'high', 'high', 'Summer peak — highest presence and feeding activity'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 8, 'high', 'high', 'Sustained peak'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 9, 'high', 'medium', 'Late season activity'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 10, 'medium', 'medium', 'Declining toward off-season'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 11, 'medium', 'low', 'Reduced activity'),
('Oceanic Whitetip', 'Tropical Pacific / Open Ocean', 12, 'medium', 'medium', 'Warming toward next peak season');

-- Great Hammerhead — Florida / Southeast USA
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Great Hammerhead', 'Florida / Southeast USA', 1, 'low', 'low', 'Winter offshore; minimal nearshore presence'),
('Great Hammerhead', 'Florida / Southeast USA', 2, 'low', 'low', 'Continued winter low'),
('Great Hammerhead', 'Florida / Southeast USA', 3, 'medium', 'low', 'Early arrivals as water warms — first hammerheads return to coast'),
('Great Hammerhead', 'Florida / Southeast USA', 4, 'high', 'high', 'Spring migration peak — hammerheads follow stingray and cownose ray migrations'),
('Great Hammerhead', 'Florida / Southeast USA', 5, 'high', 'high', 'Peak spring season along Florida east and west coasts'),
('Great Hammerhead', 'Florida / Southeast USA', 6, 'high', 'medium', 'Continued strong presence; shallow water feeding'),
('Great Hammerhead', 'Florida / Southeast USA', 7, 'medium', 'medium', 'Summer — some individuals remain; others disperse'),
('Great Hammerhead', 'Florida / Southeast USA', 8, 'medium', 'medium', 'Moderate warm-season presence'),
('Great Hammerhead', 'Florida / Southeast USA', 9, 'medium', 'low', 'Beginning to move offshore/south'),
('Great Hammerhead', 'Florida / Southeast USA', 10, 'low', 'low', 'Autumn departure accelerating'),
('Great Hammerhead', 'Florida / Southeast USA', 11, 'low', 'low', 'Winter offshore movement'),
('Great Hammerhead', 'Florida / Southeast USA', 12, 'low', 'low', 'Minimum nearshore presence');

-- Scalloped Hammerhead — Galapagos Islands
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Scalloped Hammerhead', 'Galapagos Islands', 1, 'low', 'low', 'Warm season — schools dispersed offshore'),
('Scalloped Hammerhead', 'Galapagos Islands', 2, 'low', 'low', 'Minimal nearshore aggregation'),
('Scalloped Hammerhead', 'Galapagos Islands', 3, 'low', 'low', 'Pre-season low'),
('Scalloped Hammerhead', 'Galapagos Islands', 4, 'medium', 'low', 'Early arrivals ahead of cold-water upwelling season'),
('Scalloped Hammerhead', 'Galapagos Islands', 5, 'high', 'medium', 'Schools beginning to form at Darwin and Wolf seamounts'),
('Scalloped Hammerhead', 'Galapagos Islands', 6, 'high', 'high', 'Cold Humboldt upwelling peaks — nutrient-rich water draws massive schools'),
('Scalloped Hammerhead', 'Galapagos Islands', 7, 'high', 'high', 'Peak aggregation — hundreds of individuals at seamounts'),
('Scalloped Hammerhead', 'Galapagos Islands', 8, 'high', 'high', 'Continued peak; prime dive encounter season'),
('Scalloped Hammerhead', 'Galapagos Islands', 9, 'high', 'high', 'Late peak season'),
('Scalloped Hammerhead', 'Galapagos Islands', 10, 'high', 'medium', 'Season tapering as water warms'),
('Scalloped Hammerhead', 'Galapagos Islands', 11, 'medium', 'medium', 'Schools beginning to disperse'),
('Scalloped Hammerhead', 'Galapagos Islands', 12, 'medium', 'low', 'Low season onset');

-- Scalloped Hammerhead — Australia / Indo-Pacific
INSERT INTO shark_migrations (species, region, month, presence_likelihood, feeding_activity, notes) VALUES
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 1, 'high', 'high', 'Austral summer peak — hammerheads highly active in tropical north'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 2, 'high', 'high', 'Continued summer peak'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 3, 'high', 'medium', 'Late summer; transitioning'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 4, 'medium', 'medium', 'Autumn decline'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 5, 'low', 'low', 'Cooler months — reduced activity'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 6, 'low', 'low', 'Winter minimum'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 7, 'low', 'low', 'Continued winter low'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 8, 'low', 'low', 'Pre-spring minimum'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 9, 'medium', 'low', 'Spring return beginning'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 10, 'high', 'high', 'Spring peak — hammerheads return to coastal reefs'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 11, 'high', 'high', 'Pre-summer activity at peak'),
('Scalloped Hammerhead', 'Australia / Indo-Pacific', 12, 'high', 'high', 'Summer season fully active');
