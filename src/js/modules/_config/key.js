/*
  RAJ: Transcript keys
  - first item starts with 1, not 0
  - a numeric value that represents a specific transcript and represents
    a specific logical ordering.

  - The integer part of the key represent a transcript and the decimal part
    a paragraph within the transcript.
  - The paragraphId is increased by 1 and divided by 1000

  key format: ssbbuuu.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional

  NOTE: This module is used by code running in the browser and Node so the
        common.js module system is used
*/

//import indexOf from "lodash/indexOf";
const sprintf = require("sprintf-js").sprintf;

//source id: each source has a unique id
//WOM = 10
//JSB = 11
//ACIM = 12
//RAJ = 13
const sourceId = 13;
const sid = "raj";
const prefix = "/t/raj";


//length of pageKey excluding decimal portion
const keyLength = 7;

//Raj material books (bid)
const books = [
  "yaa", "grad", "sg2002", "sg2003", "sg2004", "sg2005", "sg2006", "sg2007", "sg2008",
  "sg2009", "sg2010", "sg2011", "sg2012", "sg2013", "sg2014", "sg2015", "sg2016",
  "sg2017", "sg2018", "acq", "shorts"
];

const bookIds = ["xxx", ...books];
const acq = ["xxx", "welcome", "raj", "download"];
const grad = [
  "xxx", "g000002", "g000003", "g010491", "g010591", "g011491", "g011591", "g011691", "g011891",
  "g012091", "g012591", "g012791", "g020291", "g020591", "g020691", "g021291", "g021391", "g021491",
  "g022091", "g022591", "g030291", "g030891", "g031491", "g031991", "g032091", "g032191", "g032291",
  "g032591", "g032991"
];

const sg2002 = [
  "xxx", "061202", "073102", "080702", "081402", "082802", "090402", "091102", "091802", "092502",
  "100202", "101002", "101702", "102402", "103102", "110702", "112102", "120502", "121202", "121902"
];

const sg2003 = [
  "xxx", "010203", "010903", "011603", "012303", "020603", "021303", "022003", "022703", "030603", "031303",
  "032003", "032703", "040303", "041003", "042403", "050103", "051103", "051803", "052503", "060103", "060803",
  "061503", "062203", "062903", "070603", "071303", "072003", "072703", "080303", "081003", "081703", "082403",
  "083103", "090703", "091403", "092103", "092803", "101203", "101903", "102603", "110203", "110903", "111603",
  "112303", "120703", "121403", "122103"
];

const sg2004 = [
  "xxx", "011104", "011804", "012504", "020104", "020804", "021504", "022204", "030704", "031404", "032804",
  "040404", "041104", "041804", "042504", "050204", "050904", "051604", "052304", "053004", "061304", "062004",
  "062704", "071104", "071804", "072504", "080104", "080804", "081504", "082204", "090504", "091204", "091904",
  "092604", "100304", "101004", "101704", "102404", "110704", "112104", "112804", "120504", "121204", "121904"
];

const sg2005 = [
  "xxx", "010205", "011605", "012305", "013005", "021305", "022005", "030605", "031305", "032705", "040305",
  "041005", "041705", "042405", "050105", "050805", "052205", "060505", "061205", "061905", "070305", "071005",
  "071705", "072405", "080705", "081405", "082105", "082805", "090405", "091105", "091805", "100205", "100905",
  "101605", "102305", "110605", "111305", "112005", "120405", "121105", "121805"
];

const sg2006 = [
  "xxx", "010806", "011506", "012206", "012906", "021206", "022606", "030406", "031106", "031906", "040106",
  "041506", "042906", "050606", "052006", "052706", "060306", "061006", "061806", "062406", "070106", "071506",
  "073006", "080506", "081206", "082006", "090206", "090906", "092306", "100706", "101406", "102106", "102806",
  "111106", "111806", "120206"
];

const sg2007 = [
  "xxx", "081807", "082507", "090907", "091607", "092207", "100607", "101407", "102707", "110307", "111007",
  "111807", "120807", "121607"
];

const sg2008 = [
  "xxx", "012008", "012708", "021008", "021708", "022408", "030208", "030908", "032508", "033008", "040608",
  "041308", "042008", "050408", "051808", "052508", "060108", "060808", "061508", "062208", "070608", "071308",
  "072708", "081708", "083108", "090708", "091408", "092108", "100508", "101908", "102608", "110208", "110908",
  "112308"
];

const sg2009 = [
  "xxx", "010309", "011009", "011709", "012409", "020709", "022809", "031409", "032809", "040409", "041209",
  "042509", "050909", "052409", "053109", "060709", "061309", "062009", "071109", "071809", "072509", "080109",
  "080809", "082909", "090509", "091209", "091909", "092709", "101009", "102409", "103109", "111409", "112209",
  "112809", "120509", "121909"
];

const sg2010 = [
  "xxx", "010210", "011610", "013010", "020610", "021310", "030610", "032010", "032710", "040310", "041010",
  "050110", "051510", "052910", "060510", "061210", "061910", "070310", "071010", "071710", "072410", "080710",
  "082810", "090410", "091110", "092510", "100210", "100910", "101610", "102310", "110610", "111310", "112010",
  "112710", "120410", "121810"
];

const sg2011 = [
  "xxx", "010111", "010811", "011511", "012211", "020511", "021611", "021911", "031211", "032011", "032611",
  "040311", "040911", "041611", "042311", "043011", "050711", "051411", "052211", "060411", "061211", "061811",
  "062611", "070911", "071611", "073011", "080611", "082011", "082711", "090311", "091711", "092411", "100111",
  "101511", "102311", "110511", "111311", "112611", "120411", "121111", "122011"
];

const sg2012 = [
  "xxx", "010712", "012212", "020512", "021212", "021812", "032412", "033112", "040812", "041512", "042212",
  "042912", "051212", "052012", "060312", "061712", "072212", "072912", "080412", "081112", "081812",
  "082712", "090812", "091612", "092312", "093012", "100812", "101412", "102112", "110512", "111212"
];

const sg2013 = [
  "xxx", "042713", "050413", "051113", "052013", "052813", "060213", "060913", "062513", "063013", "070713",
  "071413", "072113", "080413", "081113", "082513", "090113", "090813", "091513", "092313", "100613", "101513",
  "102013", "102713", "110313", "112413", "122213", "123013"
];

const sg2014 = [
  "xxx", "010614", "011414", "012814", "020914", "022414", "030914", "041314", "061614", "062914", "091514"
];

const sg2015 = [
  "xxx", "041815", "042515", "050315", "050915", "051715", "060715", "061415", "062115", "062815", "070515",
  "071315", "072115", "080115", "082315", "091315", "100215", "102115", "110115"
];

const sg2016 = [
  "xxx", "070316", "071616", "080216"
];

const sg2017 = [
  "xxx", "040817", "041617", "042317", "043017", "051217", "060917", "071117", "072317", "092317", "100117",
  "101717", "120417"
];

const sg2018 = [
  "xxx", "013118", "031118", "081918", "082918"
];

const yaa = [
  "xxx", "acknowledgments", "foreword", "020782", "020882", "020982", "021082", "021182a", "021182b", "021282",
  "021382", "021482", "021682", "021782", "021882a", "021882b", "021882c", "021982", "022082", "022182a", "022182b",
  "022382a", "022382b", "022382c", "022482", "022582", "022682a", "022682b", "022682c", "022782", "022882", "030182a",
  "030182b", "030282", "030382", "030482a", "030482b", "030582a", "030582b", "030682a", "030682b", "030682c",
  "030682d", "030682e", "030882", "030982", "031082a", "031082b", "031082c", "031182", "031382", "031582", "031982",
  "032982", "033082", "042782", "042882", "042982", "043082", "050182", "050282", "050382", "050782", "050982",
  "051082a", "051082b", "051082c", "051182", "051582", "051782", "052882", "053082", "060382", "061082", "061282",
  "061482", "061982", "062182", "afterword"
];

const shorts = [
  "xxx",
  "Abandoning_Thinking_1",
  "Abandoning_Thinking_2",
  "Above_All_Else_I_Want_to_See_Your_Vision",
  "Accountability",
  "Act_of_Joining",
  "Action_of_Love",
  "Adopted_image",
  "Afraid_to_be_One",
  "Aggression_against_Self",
  "All_in_Mind",
  "All_in_your_hands",
  "All_Oneness",
  "All_the_rest_of_you",
  "Already_the_Ultimate",
  "Answering_the_call",
  "Apple_on_your_nose",
  "Are_you_willing_to_love",
  "Arena_for_Love",
  "Ascension",
  "Ask_Ask_Ask",
  "Ask_for_healing",
  "Ask_Our_Father",
  "Asking_for_help_1",
  "Asking_for_help",
  "Asking_in_the_silence",
  "Asking_out_of_devotion",
  "Atonement",
  "Attractive_nuisance",
  "Awesome_Love",
  "Back_to_the_Altar",
  "Bad_or_good_teacher",
  "Balance_point",
  "Be_open_to_more",
  "BE_with_God",
  "Bearing_witness_privately",
  "Bearing_witness_publicly",
  "BEing",
  "Belief,_believer_or_Christ",
  "Beware_of_teachers",
  "Biasing_the_Kingdom",
  "Body_density",
  "Body_meditation",
  "Bottom_line",
  "Bottom_of_the_barrel",
  "Breaking_willful_isolation",
  "Call_for_judgment",
  "Call_for_Love",
  "Chain_of_atonement",
  "Change_your_mind",
  "Changing_the_system",
  "Charity",
  "Choice_and_circumstance",
  "Choose_Joy",
  "Christhood",
  "Clear_mind",
  "Closing_Smile",
  "Co_creation",
  "Come_out_of_the_closet",
  "Comfortable_ignorance",
  "Coming_home",
  "Committed_involvement",
  "Commonality",
  "Communion",
  "Compassionate_embrace",
  "Complete_the_circuit",
  "Completed_unity_and_communion",
  "Conscious_experience_of_Eternity",
  "Conscious_judgment",
  "Continuity_of_Consciousness",
  "Cornerstone",
  "Correcting_another",
  "Correcting_problems",
  "Corrective_learning",
  "Creation",
  "Daily_bread",
  "Death_is_a_Sacrifice",
  "Decide_for_the_Altar",
  "Decloak_Christ",
  "Denial_of_Reality",
  "Direct_relationship",
  "Direction_of_awakening",
  "Direction_of_miracles",
  "Discerning_reality",
  "Disciples_for_Love",
  "Disciplined_thinking",
  "Disconnect",
  "Disconnected_perspective",
  "Discovering_willfullness_in_the_silence",
  "Disputing_your_worth",
  "Dissolve_beliefs",
  "Distancing_communion_through_fear",
  "Divine_Beings",
  "Divine_Love_embodied",
  "Divinity_of_BEing",
  "Do_you_Believe_in_Healing__Part_2",
  "Do_you_Believe_in_Healing",
  "Dreaming_from_Home",
  "Ego_costume_and_Coming_Out",
  "Ego_costume",
  "Ego_exploits",
  "ego_thought_system",
  "Embodiment_time",
  "Embody_integrity",
  "Embodying_Love",
  "Enriching_affection",
  "Errors_that_you_want",
  "Escaping_definitions_of_self",
  "Expect_a_Miracle",
  "Expect_the_answer",
  "Experimenting_from_a_grassy_knoll",
  "Facets_of_One_Diamond",
  "Fantasy_or_Miracles",
  "Fantasy",
  "Fapestry",
  "Father_Mother_God",
  "Father_says_be_still",
  "Father_says",
  "Fear_and_the_body",
  "Fearlessness",
  "Feel_the_Miracle",
  "Feng_Shui",
  "Fill_me",
  "Find_someone_to_Love",
  "Finessing_the_mind",
  "Flame_in_the_Altar",
  "Focal_point_of_creation",
  "Forgiveness_of_definitions",
  "Forgiving",
  "Fragile_dream",
  "Free_to_cooperate",
  "Fresh_ears",
  "Frightening_imagination",
  "Fulfilling_purpose",
  "Full_fledged_brother",
  "Fundamental_lesson",
  "Getting_it_fresh",
  "Gift_I_gave",
  "Gift_no_thinking",
  "Give_It_away",
  "Give_permission",
  "Given_Creation",
  "Given_everything",
  "Global_community",
  "Global_roll_call",
  "Glorifying_God",
  "Go_within_and_ask",
  "Goal_of_guidance",
  "God_derived",
  "God_extensions",
  "God_is_all_there_is",
  "God_of_group_consensus",
  "Godness_or_pretender",
  "Gods_opportunity",
  "Gods_puppet",
  "Graceful_changes",
  "Gratitude_diet",
  "Group_hallucination",
  "Guidance",
  "Haha_impossible",
  "Happy_dream",
  "He_goes_me_there",
  "Healing_at_the_Altar",
  "Healing_dominance",
  "Healing_meditation",
  "Healing_pure_energy",
  "Healing_the_separation",
  "Hearing_the_Voice",
  "Heaven_and_earth",
  "Helped_through_hate",
  "Holy_Instant_Threshold_to_Awakening",
  "Holy_Spirit_conspiring",
  "Holy_Spirit_is_you",
  "Holy_Spirit",
  "Homing_in",
  "How_much_I_love_you",
  "Humility",
  "I_Authorize_My_Body",
  "I_thank_you",
  "I_will_fit_in",
  "Illegitimacy_of_disease",
  "Illumination",
  "Im_available_to_you",
  "Im_here_to_help",
  "Im_just_waiting",
  "Impersonal_miracle",
  "In_charge_of_Sonship",
  "In_sync",
  "In_th_middle_of_the_ultimate",
  "In_touch",
  "Incompetence",
  "Increased_sensitivity",
  "Independence",
  "Individual_and_Universal",
  "Inevitable_connect",
  "Infinite_and_specific",
  "Infinite_intimacy",
  "Inflicted_good",
  "Inhale_inspiration",
  "Inspired_expression",
  "Invitation_to_God",
  "involvement",
  "Invulnerability",
  "It_really_feels_good",
  "It_worked",
  "Its_all_about_Gift",
  "Its_not_up_to_you",
  "Joining_in_brotherhood",
  "Just_one",
  "Justice_needs_a_voice",
  "Kick_my_butt",
  "Kingdom_is_your_BEing",
  "Knowledge_knowing",
  "Knowledge",
  "Lame_beggar",
  "Language_of_awareness",
  "Larger_temporal_sequence",
  "Last_act_of_willfulness",
  "Leap",
  "Learning_device",
  "Learning_to_love",
  "Learning_tool",
  "Led_like_sheep",
  "Less_dense",
  "Let_down_the_shield",
  "LET_every_occasion",
  "Let_the_answer_in",
  "Letting_go_control",
  "Letting_go_of_Doubt",
  "Life_in_the_margin",
  "Light_and_Love",
  "Listen_without_expectations",
  "Littleness_vs_Magnitude",
  "Location_of_consciousness",
  "Love_is_Love",
  "Majority_in_fear",
  "Make_the_choice",
  "Make_the_correction",
  "Make_the_distinction",
  "Maximal_Healing",
  "Meditating",
  "Meditation_1",
  "Meditation_2",
  "Meditation_3",
  "Meeting_the_need",
  "Memory_or_insight",
  "Mentoring",
  "Mind_moves",
  "Miracle_impulses",
  "Needs_and_Miracles",
  "No_crucifixion",
  "No_matter_all_Spirit",
  "No_questions_or_answers",
  "No_spillovers",
  "No_such_you_exists",
  "Not_the_function_of_mind",
  "Not_your_source",
  "Now_wholeness",
  "NOW",
  "Only_Mind",
  "Only_the_error_is_vulnerable",
  "Orbs",
  "Origin-al-sin",
  "Partnering",
  "Penetrating_the_dream",
  "Perfect_peace",
  "Persevering_in_listening",
  "Philanthropist_-_Mentors",
  "Platform_of_attention",
  "Point_of_genuineness",
  "Point_of_recognition",
  "Popping_the_bubble",
  "Power",
  "Prayer_4",
  "Prayer_and_revelation",
  "Presence_that_transforms",
  "Prickly",
  "Problem",
  "Protect_truth",
  "Protecting_the_truth",
  "Proving_God",
  "Pure_act_of_sharing",
  "Pure_intent",
  "Pure_spirit_right_now",
  "Question_to_ask_every_night",
  "Quiet_time",
  "Radical_idealism",
  "Raj_crystallization",
  "Raj_Current",
  "Raj_pump",
  "Raj_teacher_as_brother",
  "Re-embrace_the_Altar",
  "Readiness",
  "Real_power_of_the_Son",
  "Real_purpose_of_Spirit",
  "Reality",
  "Rearranging_the_world",
  "Recognize_your_error",
  "Reinforcing_egos",
  "Releasing_the_hostages",
  "Resentment",
  "Resisting_change",
  "Resisting_Reality",
  "Response_to_perception",
  "Return_to_sanity",
  "Rhythm_of_God",
  "Right_in_your_face",
  "Right_of_the_soul",
  "Ripple_effect",
  "Same_mental_error",
  "Seeing_Spirit",
  "Sending_out_messengers",
  "Serving_transformationally",
  "Shake_on_the_shoulder",
  "Share_the_learning",
  "Shared_clarity",
  "Shift_from_get_to_give",
  "Simple_involvement",
  "Singlemindedness",
  "So_and_so",
  "Soul_meaning",
  "Spontaneous_shift",
  "Squinched_eyes",
  "Stuckness_in_the_dream",
  "Sublim_Healing_1",
  "Sublim_Healing_2",
  "Sublim_Healing_3",
  "Talk_to_me",
  "Tares_and_wheat",
  "Taste_of_heaven",
  "Teachers_as_BEers",
  "Thank_you",
  "The_Answer_in_you",
  "The_answer",
  "The_Currents_of_good_pleasure",
  "The_Father",
  "The_gift_you_cant_hold_in",
  "The_impossibility_of_being_lost",
  "The_Living_Christ",
  "The_need",
  "The_nothing_place",
  "The_one_you_divinely_are",
  "The_place_of_Excellence",
  "The_Plan_of_Atonement",
  "The_temple_and_the_Altar",
  "The_Ultimate_Healing",
  "The_Voice_for_Truth",
  "The_world_as_the_Kingdom_of_Heaven",
  "Thought_adjuster",
  "Thoughts_govern_experience",
  "Threshold_of_discovery",
  "Time_collapse",
  "Tinkling_brass",
  "To_be_grounded",
  "Totality_of_you",
  "Touching_integrity",
  "Transfer_value",
  "Transformational_ripple",
  "True_prayer",
  "True_presence",
  "True_Reflection",
  "Truth_and_integrity",
  "Truth",
  "Turn_and_inquire",
  "Turn_around_again",
  "Undefended_charity",
  "Under_my_guidance",
  "Undercurrent_calling",
  "Undivided_desire",
  "Undo_the_dream",
  "Undoing_the_act_of_independence",
  "Unguarded_penetration_of_divinity",
  "Unlearning",
  "Valuing_wholesomeness",
  "Venetian_blind",
  "Waging_peace",
  "Wailing",
  "Waiting_upon_God",
  "Walking_through_the_wall_of_fear",
  "We_feel_your_absence",
  "Weakening_the_bubble",
  "Weakening_time",
  "Weight_Is_Not_the_Issue",
  "What_do_you_treasure",
  "What_is_the_holy_instant",
  "Where_its_at",
  "Will_ye_first_seek_the_Kingdom",
  "Willingness_to_persist",
  "Witnessing_for_another",
  "Witnessing_for_the_Miraculous",
  "Wonder_of_life",
  "workbook_ammi",
  "Yield_to_GodMind",
  "Yield_to_the_Fathers_Will",
  "Yielding_to_the_river",
  "You_are_a_thought_of_God",
  "You_are_a_verb",
  "You_are_confronted_with_reality",
  "You_are_consciousness",
  "You_are_Mind",
  "You_are_not_in_charge",
  "You_are_salvation",
  "You_are_what_you_BE",
  "You_cant_do_it_on_your_own",
  "You_need_each_other",
  "You_receive_as_much_as_you_let_in",
  "Your_function"
];

const contents = {
  acq: acq,
  yaa: yaa,
  grad: grad,
  sg2002: sg2002,
  sg2003: sg2003,
  sg2004: sg2004,
  sg2005: sg2005,
  sg2006: sg2006,
  sg2007: sg2007,
  sg2008: sg2008,
  sg2009: sg2009,
  sg2010: sg2010,
  sg2011: sg2011,
  sg2012: sg2012,
  sg2013: sg2013,
  sg2014: sg2014,
  sg2015: sg2015,
  sg2016: sg2016,
  sg2017: sg2017,
  sg2018: sg2018,
  shorts: shorts
};

function splitUrl(url) {
  let u = url;

  //remove leading "/"
  u = url.substr(1);

  //remove trailing '/' if it exists
  if (u[u.length-1] === "/") {
    u = u.substr(0, u.length - 1);
  }

  return u.split("/");
}

/*
  return the position of unit in the bid array
*/
function getUnitId(bid, unit) {
  if (contents[bid]) {
    return contents[bid].indexOf(unit);
  }
  else {
    throw new Error(`unexpected bookId: ${bid}`);
  }
}

function getSourceId() {
  return sourceId;
}

function getKeyInfo() {
  return {
    sourceId: sourceId,
    keyLength: keyLength
  };
}

/*
  parse bookmarkId into pageKey and paragraphId
  - pid=0 indicates no paragraph id
*/
function parseKey(key) {
  const keyInfo = getKeyInfo();
  let keyString = key;
  let pid = 0;

  if (typeof keyString === "number") {
    keyString = key.toString(10);
  }

  let decimalPos = keyString.indexOf(".");

  //if no decimal key doesn't include paragraph id
  if (decimalPos > -1) {
    let decimalPart = keyString.substr(decimalPos + 1);

    //append 0's if decimal part < 3
    switch(decimalPart.length) {
      case 1:
        decimalPart = `${decimalPart}00`;
        break;
      case 2:
        decimalPart = `${decimalPart}0`;
        break;
    }
    pid = parseInt(decimalPart, 10);
  }
  let pageKey = parseInt(keyString.substr(0, keyInfo.keyLength), 10);

  return {pid, pageKey};
}

/*
  Convert url into key
  returns -1 for non-transcript url

  key format: ssbuuIqq.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional
*/
function genPageKey(url = location.pathname) {
  let key = {
    sid: sourceId,
    bid: 0,
    uid: 0,
    qid: 0
  };

  let parts = splitUrl(url);

  //key.bid = indexOf(bookIds, parts[0]);
  key.bid = bookIds.indexOf(parts[2]);
  if (key.bid === -1) {
    return -1;
  }
  key.uid = getUnitId(parts[2], parts[3]);
  if (key.bid === -1) {
    return -1;
  }

  let compositeKey = sprintf("%02s%02s%03s", key.sid, key.bid, key.uid);
  let numericKey = parseInt(compositeKey, 10);

  return numericKey;
}

/*
  genParagraphKey(paragraphId, key: url || pageKey)

  args:
    pid: a string representing a transcript paragraph, starts as "p0"..."pnnn"
         - it's converted to number and incremented by 1 then divided by 1000
        pid can also be a number so then we just increment it and divide by 1000

    key: either a url or pageKey returned from genPageKey(), if key
   is a string it is assumed to be a url
*/
function genParagraphKey(pid, key = location.pathname) {
  let numericKey = key;
  let pKey;

  if (typeof pid === "string") {
    pKey = (parseInt(pid.substr(1), 10) + 1) / 1000;
  }
  else {
    pKey = (pid + 1)/1000;
  }

  //if key is a string it represents a url
  if (typeof key === "string") {
    numericKey = genPageKey(key);
  }

  let paragraphKey = numericKey + pKey;

  return paragraphKey;
}

/*
  key format: ssbuuIqq.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional
*/
function decodeKey(key) {
  let {pid, pageKey} = parseKey(key);
  let pageKeyString = pageKey.toString(10);
  let decodedKey = {
    error: 0,
    message: "ok",
    sid: sourceId,
    bookId: "",
    uid: 0,
    pid: pid - 1
  };

  //error, invalid key length
  if (pageKeyString.length !== keyLength) {
    decodedKey.error = true;
    decodedKey.message = `Integer portion of key should have a length of ${keyLength}, key is: ${pageKeyString}`;
    return decodedKey;
  }

  let bid = parseInt(pageKeyString.substr(2,2), 10);
  decodedKey.bookId = bookIds[bid];

  //subtract 1 from key value to get index
  decodedKey.uid = parseInt(pageKeyString.substr(4,3), 10) - 1;

  return decodedKey;
}

function getBooks() {
  return books;
}

/*
  Return the number of chapters in the book (bid).
  Subtract one from length because of 'xxx' (fake chapter)
*/
function getNumberOfUnits(bid) {
  if (contents[bid]) {
    return contents[bid].length - 1;
  }
  else {
    throw new Error(`getNumberOfUnits() unexpected bookId: ${bid}`);
  }
}

/*
 * Convert page key to url
 */
function getUrl(key, withPrefix = false) {
  let decodedKey = decodeKey(key, false);
  let unit = "invalid";

  if (decodedKey.error) {
    return "/invalid/key/";
  }

  if (contents[decodedKey.bookId]) {
    unit = contents[decodedKey.bookId][decodedKey.uid + 1];
  }

  if (withPrefix) {
    return `${prefix}/${decodedKey.bookId}/${unit}/`;
  }
  else {
    return `/${decodedKey.bookId}/${unit}/`;
  }
}

/*
 * Convert page key to url
function getUrl(key) {
  let decodedKey = decodeKey(key);
  let unit = "invalid";

  if (decodedKey.error) {
    return "/invalid/key/";
  }

  if (contents[decodedKey.bookId]) {
    unit = contents[decodedKey.bookId][decodedKey.uid + 1];
  }

  return `/${decodedKey.bookId}/${unit}/`;
}
 */

/*
  Describe key in terms of source:book:unit:p
*/
function describeKey(key) {
  let decodedKey = decodeKey(key, false);

  if (decodedKey.error) {
    return {key: key, error: true, source: sid};
  }

  let info = {
    key: key,
    source: sid,
    book: decodedKey.bookId,
    unit: contents[decodedKey.bookId][decodedKey.uid + 1]
  };

  if (decodedKey.pid > -1) {
    info.pid = `p${decodedKey.pid}`;
  }

  return info;
}

module.exports = {
  getNumberOfUnits: getNumberOfUnits,
  getBooks: getBooks,
  getUrl: getUrl,
  getSourceId: getSourceId,
  getKeyInfo: getKeyInfo,
  parseKey: parseKey,
  getUnitId: getUnitId,
  genPageKey: genPageKey,
  genParagraphKey: genParagraphKey,
  decodeKey: decodeKey,
  describeKey: describeKey
};

