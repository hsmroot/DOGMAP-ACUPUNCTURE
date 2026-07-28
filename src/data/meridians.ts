import { snapToSkin, trunkAt } from "@/components/dog/anatomy";

export type Vec3 = [number, number, number];

export interface AcuPoint {
  code: string;
  name: string;
  note: string;
  pos: Vec3;
  /** midline points are not mirrored */
  midline?: boolean;
}

export interface Meridian {
  id: string;
  code: string;
  name: string;
  element: string;
  polarity: "Yin" | "Yang" | "Extraordinary";
  color: string;
  summary: string;
  points: AcuPoint[];
}

/**
 * Point locations are anatomically-informed approximations mapped onto the
 * stylised dog in this scene. x = nose(+) to tail(-), y = up, z = right(+).
 * Reference: classical TCVM canine meridian charts (Tallgrass / Xie & Preast).
 */
export const MERIDIANS: Meridian[] = [
  {
    id: "lu",
    code: "LU",
    name: "Lung",
    element: "Metal",
    polarity: "Yin",
    color: "#e8e2d6",
    summary:
      "Runs from the cranial chest down the medial forelimb to the inside of the dewclaw. Governs respiration, skin and the body's defensive qi.",
    points: [
      { code: "LU 1", name: "Zhong Fu", note: "Cranial chest, in the groove in front of the shoulder joint. Coughing, chest pain.", pos: [1.62, 1.35, 0.52] },
      { code: "LU 5", name: "Chi Ze", note: "Medial crease of the elbow, lateral to the biceps tendon. Elbow pain, cough.", pos: [1.28, 0.98, 0.28] },
      { code: "LU 7", name: "Lie Que", note: "Medial forelimb above the carpus. Master point of the head and neck.", pos: [1.3, 0.6, 0.28] },
      { code: "LU 9", name: "Tai Yuan", note: "Medial side of the carpus. Influential point for blood vessels and pulse.", pos: [1.32, 0.44, 0.3] },
      { code: "LU 11", name: "Shao Shang", note: "Medial nail bed of the first digit. Sore throat, emergency resuscitation.", pos: [1.4, 0.09, 0.3] },
    ],
  },
  {
    id: "li",
    code: "LI",
    name: "Large Intestine",
    element: "Metal",
    polarity: "Yang",
    color: "#e8912d",
    summary:
      "Travels from the forepaw up the cranial forelimb, across the shoulder to the face. Clears heat, relieves pain, supports the bowel.",
    points: [
      { code: "LI 4", name: "He Gu", note: "Between the 2nd and 3rd metacarpals. Master point of the face and mouth; analgesia.", pos: [1.34, 0.2, 0.5] },
      { code: "LI 10", name: "Shou San Li", note: "Cranio-lateral forelimb below the elbow. Forelimb lameness, GI tonic.", pos: [1.28, 0.8, 0.55] },
      { code: "LI 11", name: "Qu Chi", note: "Lateral end of the elbow crease. Strong heat-clearing and immune point.", pos: [1.3, 1.0, 0.55] },
      { code: "LI 15", name: "Jian Yu", note: "Cranial to the shoulder joint. Shoulder lameness.", pos: [1.5, 1.5, 0.6] },
      { code: "LI 16", name: "Ju Gu", note: "In front of the scapula at the base of the neck.", pos: [1.72, 1.75, 0.45] },
      { code: "LI 20", name: "Ying Xiang", note: "Beside the nostril. Nasal congestion, sneezing, rhinitis.", pos: [3.32, 2.2, 0.16] },
    ],
  },
  {
    id: "st",
    code: "ST",
    name: "Stomach",
    element: "Earth",
    polarity: "Yang",
    color: "#b6702c",
    summary:
      "Descends from below the eye along the ventro-lateral trunk to the hind paw. The great tonifying channel for digestion and appetite.",
    points: [
      { code: "ST 1", name: "Cheng Qi", note: "Directly below the pupil on the lower orbital rim. Eye disorders.", pos: [3.0, 2.44, 0.28] },
      { code: "ST 2", name: "Si Bai", note: "Below ST 1 in the infraorbital fossa. Facial paralysis.", pos: [3.06, 2.32, 0.26] },
      { code: "ST 4", name: "Di Cang", note: "Corner of the mouth. Facial nerve paralysis, drooling.", pos: [3.1, 2.12, 0.22] },
      { code: "ST 8", name: "Tou Wei", note: "Temporal region at the corner of the forehead. Headache, epilepsy.", pos: [2.6, 2.86, 0.26] },
      { code: "ST 25", name: "Tian Shu", note: "Lateral to the umbilicus. Alarm point of the Large Intestine; diarrhoea.", pos: [-0.35, 0.98, 0.45] },
      { code: "ST 35", name: "Du Bi", note: "Lateral hollow of the stifle joint. Stifle arthritis, cruciate support.", pos: [-1.12, 0.95, 0.52] },
      { code: "ST 36", name: "Zu San Li", note: "Lateral to the tibial crest. Master point of the abdomen and GI; whole-body tonic.", pos: [-1.2, 0.78, 0.52] },
      { code: "ST 40", name: "Feng Long", note: "Mid lateral tibia. Resolves phlegm, chronic cough.", pos: [-1.38, 0.58, 0.5] },
      { code: "ST 41", name: "Jie Xi", note: "Front of the hock joint. Hock pain, hind limb weakness.", pos: [-1.44, 0.42, 0.46] },
      { code: "ST 45", name: "Li Dui", note: "Lateral nail bed of the 3rd digit, hind paw. Clears stomach heat.", pos: [-1.3, 0.09, 0.46] },
    ],
  },
  {
    id: "sp",
    code: "SP",
    name: "Spleen",
    element: "Earth",
    polarity: "Yin",
    color: "#8a5a3c",
    summary:
      "Ascends from the medial hind paw along the inside of the leg to the flank and thorax. Transforms food into qi and blood, holds blood in vessels.",
    points: [
      { code: "SP 1", name: "Yin Bai", note: "Medial nail bed of the 2nd digit, hind paw. Bleeding disorders.", pos: [-1.3, 0.09, -0.24] },
      { code: "SP 3", name: "Tai Bai", note: "Medial hind paw at the metatarsophalangeal joint. Source point; digestion.", pos: [-1.36, 0.2, -0.26] },
      { code: "SP 6", name: "San Yin Jiao", note: "Medial tibia above the hock. Meeting of the three yin; urogenital and blood tonic.", pos: [-1.4, 0.6, -0.3] },
      { code: "SP 9", name: "Yin Ling Quan", note: "Medial stifle below the condyle. Resolves damp, oedema, diarrhoea.", pos: [-1.16, 0.92, -0.32] },
      { code: "SP 10", name: "Xue Hai", note: "Medial thigh above the patella. Sea of blood; skin disease, itching.", pos: [-1.05, 1.16, -0.36] },
      { code: "SP 21", name: "Da Bao", note: "Lateral thorax in the 7th intercostal space. Generalised pain, weakness.", pos: [0.55, 1.45, 0.62] },
    ],
  },
  {
    id: "ht",
    code: "HT",
    name: "Heart",
    element: "Fire",
    polarity: "Yin",
    color: "#d9313b",
    summary:
      "Emerges in the axilla and runs down the caudo-medial forelimb. Houses the spirit (shen); calms anxiety and settles the mind.",
    points: [
      { code: "HT 1", name: "Ji Quan", note: "Centre of the axilla. Chest fullness, elbow pain.", pos: [1.35, 1.25, 0.32] },
      { code: "HT 3", name: "Shao Hai", note: "Medial elbow crease. Calms the shen, tremors.", pos: [1.2, 1.0, 0.24] },
      { code: "HT 7", name: "Shen Men", note: "Caudo-medial carpus. Gate of the spirit; anxiety, insomnia, palpitations.", pos: [1.24, 0.44, 0.24] },
      { code: "HT 9", name: "Shao Chong", note: "Medial nail bed of the 5th digit. Clears heart heat, collapse.", pos: [1.28, 0.09, 0.16] },
    ],
  },
  {
    id: "si",
    code: "SI",
    name: "Small Intestine",
    element: "Fire",
    polarity: "Yang",
    color: "#f0574f",
    summary:
      "Runs from the forepaw along the caudo-lateral forelimb, over the scapula to the face and ear. Separates the pure from the impure.",
    points: [
      { code: "SI 1", name: "Shao Ze", note: "Lateral nail bed of the 5th digit. Lactation, fever, shock.", pos: [1.3, 0.09, 0.58] },
      { code: "SI 3", name: "Hou Xi", note: "Lateral forepaw behind the 5th metacarpal. Master point of the neck and back.", pos: [1.28, 0.24, 0.6] },
      { code: "SI 8", name: "Xiao Hai", note: "Caudal elbow between olecranon and epicondyle. Elbow pain.", pos: [1.16, 1.02, 0.58] },
      { code: "SI 9", name: "Jian Zhen", note: "Caudal to the shoulder joint. Shoulder lameness, forelimb paresis.", pos: [1.24, 1.5, 0.62] },
      { code: "SI 16", name: "Tian Chuang", note: "Lateral neck along the jugular groove. Neck stiffness, throat.", pos: [2.15, 2.1, 0.4] },
      { code: "SI 19", name: "Ting Gong", note: "In front of the ear canal. Ear infections, deafness.", pos: [2.5, 2.62, 0.4] },
    ],
  },
  {
    id: "bl",
    code: "BL",
    name: "Bladder",
    element: "Water",
    polarity: "Yang",
    color: "#2d4c8f",
    summary:
      "The longest channel: two lines run either side of the spine, carrying the association (shu) points of every organ, then descend to the hind paw.",
    points: [
      { code: "BL 1", name: "Jing Ming", note: "Medial canthus of the eye. All eye disorders.", pos: [2.94, 2.55, 0.2] },
      { code: "BL 11", name: "Da Zhu", note: "Lateral to the space between T1-T2. Influential point for bone.", pos: [1.55, 1.95, 0.22] },
      { code: "BL 13", name: "Fei Shu", note: "Lung association point, T3-T4. Cough, asthma, skin.", pos: [1.25, 1.98, 0.24] },
      { code: "BL 14", name: "Jue Yin Shu", note: "Pericardium association point, T4-T5.", pos: [1.05, 1.99, 0.24] },
      { code: "BL 15", name: "Xin Shu", note: "Heart association point, T5-T6. Anxiety, arrhythmia.", pos: [0.85, 2.0, 0.24] },
      { code: "BL 17", name: "Ge Shu", note: "Diaphragm shu, T7-T8. Influential point for blood.", pos: [0.5, 2.0, 0.24] },
      { code: "BL 18", name: "Gan Shu", note: "Liver association point, T10-T11.", pos: [0.25, 2.0, 0.24] },
      { code: "BL 19", name: "Dan Shu", note: "Gall Bladder association point, T10-T11.", pos: [0.1, 2.0, 0.24] },
      { code: "BL 20", name: "Pi Shu", note: "Spleen association point, T12-T13. Chronic digestive weakness.", pos: [-0.1, 2.0, 0.24] },
      { code: "BL 21", name: "Wei Shu", note: "Stomach association point, T13-L1. Vomiting, poor appetite.", pos: [-0.3, 2.0, 0.24] },
      { code: "BL 22", name: "San Jiao Shu", note: "Triple Heater association point, L1-L2.", pos: [-0.5, 1.99, 0.24] },
      { code: "BL 23", name: "Shen Shu", note: "Kidney association point, L2-L3. Renal support, back pain, ageing.", pos: [-0.7, 1.98, 0.24] },
      { code: "BL 25", name: "Da Chang Shu", note: "Large Intestine association point, L4-L5. Colitis, lumbar pain.", pos: [-1.0, 1.95, 0.24] },
      { code: "BL 27", name: "Xiao Chang Shu", note: "Small Intestine association point, at the sacrum.", pos: [-1.3, 1.88, 0.24] },
      { code: "BL 28", name: "Pang Guang Shu", note: "Bladder association point, sacrum. Incontinence, cystitis.", pos: [-1.45, 1.84, 0.24] },
      { code: "BL 40", name: "Wei Zhong", note: "Centre of the popliteal crease. Master point of the back and hips.", pos: [-1.42, 1.0, 0.42] },
      { code: "BL 58", name: "Fei Yang", note: "Caudo-lateral tibia. Lumbar pain, hind limb weakness.", pos: [-1.55, 0.62, 0.42] },
      { code: "BL 60", name: "Kun Lun", note: "Lateral hock, between malleolus and Achilles tendon. Aspirin point for pain.", pos: [-1.56, 0.42, 0.44] },
      { code: "BL 64", name: "Jing Gu", note: "Lateral hind paw at the 5th metatarsal base. Source point.", pos: [-1.42, 0.22, 0.5] },
      { code: "BL 67", name: "Zhi Yin", note: "Lateral nail bed of the 5th digit. Malposition, headache.", pos: [-1.32, 0.09, 0.52] },
    ],
  },
  {
    id: "ki",
    code: "KI",
    name: "Kidney",
    element: "Water",
    polarity: "Yin",
    color: "#2f7fd4",
    summary:
      "Rises from the hind paw along the medial leg and ventral abdomen to the chest. Stores essence (jing); governs bones, ears and longevity.",
    points: [
      { code: "KI 1", name: "Yong Quan", note: "Between the metatarsal pads. Resuscitation, heat stroke.", pos: [-1.34, 0.05, -0.3] },
      { code: "KI 3", name: "Tai Xi", note: "Medial hock between malleolus and Achilles tendon. Kidney tonic.", pos: [-1.5, 0.42, -0.38] },
      { code: "KI 5", name: "Shui Quan", note: "Below KI 3 on the medial hock. Irregular urination.", pos: [-1.48, 0.32, -0.38] },
      { code: "KI 7", name: "Fu Liu", note: "Medial tibia above KI 3. Regulates sweating and fluid.", pos: [-1.46, 0.62, -0.36] },
      { code: "KI 10", name: "Yin Gu", note: "Medial popliteal crease. Urogenital disorders.", pos: [-1.3, 0.98, -0.34] },
      { code: "KI 27", name: "Shu Fu", note: "Ventral chest beside the sternum, at the 1st rib. Cough, dyspnoea.", pos: [1.55, 1.12, 0.24] },
    ],
  },
  {
    id: "pc",
    code: "PC",
    name: "Pericardium",
    element: "Fire",
    polarity: "Yin",
    color: "#e874a8",
    summary:
      "The heart's protector. Runs from the chest along the mid-medial forelimb to the middle digit. Calms the mind and eases nausea.",
    points: [
      { code: "PC 1", name: "Tian Chi", note: "Lateral chest in the 4th intercostal space. Chest oppression.", pos: [1.3, 1.15, 0.5] },
      { code: "PC 3", name: "Qu Ze", note: "Medial elbow crease on the biceps tendon. Vomiting, heat.", pos: [1.24, 0.99, 0.2] },
      { code: "PC 6", name: "Nei Guan", note: "Medial forelimb above the carpus. Nausea, motion sickness, anxiety.", pos: [1.26, 0.62, 0.2] },
      { code: "PC 7", name: "Da Ling", note: "Middle of the medial carpus. Calms the shen, carpal pain.", pos: [1.27, 0.44, 0.2] },
      { code: "PC 9", name: "Zhong Chong", note: "Nail bed of the 3rd digit. Collapse, high fever.", pos: [1.36, 0.09, 0.4] },
    ],
  },
  {
    id: "th",
    code: "TH",
    name: "Triple Heater",
    element: "Fire",
    polarity: "Yang",
    color: "#c04fb0",
    summary:
      "Ascends the lateral forelimb, crosses the shoulder and ends at the brow. Coordinates fluid metabolism across the three body cavities.",
    points: [
      { code: "TH 1", name: "Guan Chong", note: "Lateral nail bed of the 4th digit. Fever, sore throat.", pos: [1.32, 0.09, 0.54] },
      { code: "TH 4", name: "Yang Chi", note: "Dorsal carpus in the joint depression. Carpal pain.", pos: [1.34, 0.44, 0.5] },
      { code: "TH 5", name: "Wai Guan", note: "Lateral forelimb above the carpus. Connecting point; ear disease, fever.", pos: [1.33, 0.62, 0.52] },
      { code: "TH 6", name: "Zhi Gou", note: "Above TH 5 on the lateral forelimb. Constipation.", pos: [1.32, 0.74, 0.53] },
      { code: "TH 10", name: "Tian Jing", note: "Above the olecranon. Elbow pain, nodules.", pos: [1.18, 1.1, 0.56] },
      { code: "TH 14", name: "Jian Liao", note: "Caudo-dorsal to the shoulder joint. Shoulder lameness.", pos: [1.3, 1.6, 0.6] },
      { code: "TH 17", name: "Yi Feng", note: "In the hollow behind the ear base. Ear infection, facial paralysis.", pos: [2.4, 2.68, 0.38] },
      { code: "TH 23", name: "Si Zhu Kong", note: "Lateral end of the brow. Eye disorders, headache.", pos: [2.86, 2.7, 0.3] },
    ],
  },
  {
    id: "gb",
    code: "GB",
    name: "Gall Bladder",
    element: "Wood",
    polarity: "Yang",
    color: "#39b06a",
    summary:
      "Zig-zags from the eye over the head and along the lateral body to the hind paw. Frees the sinews and the sides of the body.",
    points: [
      { code: "GB 1", name: "Tong Zi Liao", note: "Lateral canthus of the eye. Conjunctivitis, tearing.", pos: [2.9, 2.6, 0.3] },
      { code: "GB 20", name: "Feng Chi", note: "Depression at the base of the skull, beside the poll. Wind-expelling; neck pain.", pos: [2.24, 2.72, 0.28] },
      { code: "GB 21", name: "Jian Jing", note: "Cranial edge of the scapula at the withers. Shoulder and neck tension.", pos: [1.68, 1.9, 0.4] },
      { code: "GB 25", name: "Jing Men", note: "Free end of the last rib. Alarm point of the Kidney.", pos: [-0.55, 1.6, 0.55] },
      { code: "GB 29", name: "Ju Liao", note: "In front of the hip joint. Hip dysplasia, coxofemoral pain.", pos: [-1.1, 1.58, 0.5] },
      { code: "GB 30", name: "Huan Tiao", note: "Behind the greater trochanter. Major hip and sciatic point.", pos: [-1.35, 1.5, 0.5] },
      { code: "GB 34", name: "Yang Ling Quan", note: "Below the lateral stifle, in front of the fibular head. Influential point for tendons.", pos: [-1.22, 0.86, 0.5] },
      { code: "GB 39", name: "Xuan Zhong", note: "Lateral tibia above the hock. Influential point for marrow.", pos: [-1.5, 0.56, 0.46] },
      { code: "GB 40", name: "Qiu Xu", note: "Cranio-lateral to the lateral malleolus. Hock sprain.", pos: [-1.46, 0.4, 0.5] },
      { code: "GB 41", name: "Zu Lin Qi", note: "Dorsal hind paw between the 4th and 5th metatarsals. Master point with TH 5.", pos: [-1.38, 0.22, 0.48] },
      { code: "GB 44", name: "Zu Qiao Yin", note: "Lateral nail bed of the 4th digit. Headache, eye pain.", pos: [-1.3, 0.09, 0.44] },
    ],
  },
  {
    id: "liv",
    code: "LIV",
    name: "Liver",
    element: "Wood",
    polarity: "Yin",
    color: "#1f7a4d",
    summary:
      "Climbs the medial hind limb to the flank and ribs. Stores blood, smooths the flow of qi and governs the eyes, tendons and temperament.",
    points: [
      { code: "LIV 1", name: "Da Dun", note: "Medial nail bed of the 2nd digit, hind paw. Urogenital, collapse.", pos: [-1.28, 0.09, -0.3] },
      { code: "LIV 2", name: "Xing Jian", note: "Between the 2nd and 3rd digits. Clears liver fire, irritability.", pos: [-1.32, 0.16, -0.3] },
      { code: "LIV 3", name: "Tai Chong", note: "Dorso-medial hind paw between metatarsals. Master point for calming and eyes.", pos: [-1.38, 0.24, -0.32] },
      { code: "LIV 5", name: "Li Gou", note: "Medial tibia. Genital itching, urinary retention.", pos: [-1.42, 0.56, -0.34] },
      { code: "LIV 8", name: "Qu Quan", note: "Medial end of the stifle crease. Stifle pain, urogenital tonic.", pos: [-1.2, 0.98, -0.36] },
      { code: "LIV 13", name: "Zhang Men", note: "Free end of the 12th rib. Alarm point of the Spleen; influential for organs.", pos: [-0.4, 1.5, -0.58] },
      { code: "LIV 14", name: "Qi Men", note: "6th intercostal space near the costal arch. Alarm point of the Liver.", pos: [0.5, 1.2, -0.58] },
    ],
  },
  {
    id: "gv",
    code: "GV",
    name: "Governing Vessel",
    element: "Extraordinary",
    polarity: "Extraordinary",
    color: "#1c1c1c",
    summary:
      "Runs along the dorsal midline from the tail base over the spine and skull to the upper lip. Sea of all yang; commands the spine and brain.",
    points: [
      { code: "GV 1", name: "Chang Qiang", note: "Between the anus and the tail base. Prolapse, incontinence, tail paralysis.", pos: [-1.78, 1.55, 0], midline: true },
      { code: "GV 4", name: "Ming Men", note: "Between L2 and L3 on the midline. Gate of life; warms kidney yang.", pos: [-0.7, 2.06, 0], midline: true },
      { code: "GV 14", name: "Da Zhui", note: "Between C7 and T1 at the withers. Clears fever, immune support.", pos: [1.62, 2.0, 0], midline: true },
      { code: "GV 20", name: "Bai Hui (head)", note: "Dorsal midline of the skull between the ears. Lifts spirit, calms, epilepsy.", pos: [2.42, 2.86, 0], midline: true },
      { code: "GV 26", name: "Ren Zhong", note: "Philtrum below the nose. Emergency resuscitation, shock, collapse.", pos: [3.4, 2.24, 0], midline: true },
    ],
  },
  {
    id: "cv",
    code: "CV",
    name: "Conception Vessel",
    element: "Extraordinary",
    polarity: "Extraordinary",
    color: "#6b6b6b",
    summary:
      "Travels the ventral midline from the pelvic floor to the chin. Sea of all yin; nourishes fluids, blood and the reproductive organs.",
    points: [
      { code: "CV 1", name: "Hui Yin", note: "Perineum, between anus and genitals. Resuscitation, urogenital.", pos: [-1.7, 1.15, 0], midline: true },
      { code: "CV 4", name: "Guan Yuan", note: "Ventral midline caudal to the umbilicus. Alarm point of Small Intestine; tonifies qi.", pos: [-0.75, 0.9, 0], midline: true },
      { code: "CV 8", name: "Shen Que", note: "Centre of the umbilicus. Moxa point for cold diarrhoea and collapse.", pos: [-0.3, 0.92, 0], midline: true },
      { code: "CV 12", name: "Zhong Wan", note: "Midway between umbilicus and xiphoid. Alarm point of the Stomach.", pos: [0.35, 0.98, 0], midline: true },
      { code: "CV 17", name: "Shan Zhong", note: "Sternum at the level of the 4th intercostal space. Influential for qi; asthma, grief.", pos: [1.2, 1.06, 0], midline: true },
      { code: "CV 24", name: "Cheng Jiang", note: "Centre of the chin below the lower lip. Facial paralysis, drooling.", pos: [3.24, 2.02, 0], midline: true },
    ],
  },
  {
    id: "extra",
    code: "EX",
    name: "Classical Extra Points",
    element: "Extraordinary",
    polarity: "Extraordinary",
    color: "#d8b23f",
    summary:
      "Named points that sit outside the twelve channels but are used constantly in canine practice.",
    points: [
      { code: "Bai Hui", name: "Hundred Meetings", note: "Lumbosacral space on the midline. The single most used point for hind end weakness and back pain.", pos: [-1.32, 1.9, 0], midline: true },
      { code: "Yin Tang", name: "Hall of Impression", note: "Midline between the eyes. Calming, anxiety, nasal disease.", pos: [3.0, 2.66, 0], midline: true },
      { code: "GVT", name: "Governing Vessel Tip", note: "Tip of the tail. Emergency resuscitation and shock.", pos: [-3.05, 2.35, 0], midline: true },
      { code: "Wei Jian", name: "Tail Base Fold", note: "Lateral tail base. Sacral and tail mobility.", pos: [-1.85, 1.72, 0.16] },
      { code: "Er Jian", name: "Ear Apex", note: "Tip of the ear. Bleed point for heat, fever and skin allergy.", pos: [2.36, 3.16, 0.3] },
    ],
  },
];

export interface FlatPoint extends AcuPoint {
  meridianId: string;
  meridianName: string;
  meridianCode: string;
  color: string;
  side: "L" | "R" | "M";
  key: string;
}

/**
 * Points that lie on the trunk (dorsal spine line, costal arch, ventral
 * midline). These are projected onto the dog's actual skin so they sit exactly
 * over the vertebrae and intercostal spaces instead of floating.
 */
const SURFACE_CODES = new Set([
  "BL 11", "BL 13", "BL 14", "BL 15", "BL 17", "BL 18", "BL 19", "BL 20",
  "BL 21", "BL 22", "BL 23", "BL 25", "BL 27", "BL 28",
  "GV 1", "GV 4", "GV 14", "Bai Hui", "Wei Jian",
  "GB 21", "GB 25", "GB 29", "GB 30",
  "LIV 13", "LIV 14", "SP 21", "ST 25", "PC 1", "LU 1", "SI 9", "TH 14", "LI 16",
  "KI 27", "CV 1", "CV 4", "CV 8", "CV 12", "CV 17",
]);

interface _Unused {
  meridianId: string;
  meridianName: string;
  meridianCode: string;
  color: string;
  side: "L" | "R" | "M";
  key: string;
}

export const ALL_POINTS: FlatPoint[] = MERIDIANS.flatMap((m) =>
  m.points.flatMap((p): FlatPoint[] => {
    const base = {
      ...p,
      meridianId: m.id,
      meridianName: m.name,
      meridianCode: m.code,
      color: m.color,
    };
    const pos = SURFACE_CODES.has(p.code) ? snapToSkin(p.pos) : p.pos;
    if (p.midline) {
      return [{ ...base, pos, side: "M" as const, key: `${m.id}-${p.code}-M` }];
    }
    const [x, y, z] = pos;
    return [
      { ...base, side: "R" as const, key: `${m.id}-${p.code}-R`, pos: [x, y, z] as Vec3 },
      { ...base, side: "L" as const, key: `${m.id}-${p.code}-L`, pos: [x, y, -z] as Vec3 },
    ];
  }),
);

export const TOTAL_UNIQUE_POINTS = MERIDIANS.reduce((n, m) => n + m.points.length, 0);