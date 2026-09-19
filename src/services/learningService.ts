/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonSegment, ImportantWord } from '../types.ts';
import { speechToTextService } from './speechToTextService.ts';

/**
 * ============================================================================
 * FUTURE AI & API PROCESSING PIPELINE ARCHITECTURE
 * ============================================================================
 *
 * Current Architecture (Frontend Simulation Phase):
 * [Microphone Audio] -> [MediaRecorder] -> [learningService.processAudioLesson] -> [Structured LessonSegment]
 *
 * Future Production Pipeline (When backend/API is connected):
 * 1. Audio Ingestion:
 *    Stream raw PCM / webm audio via WebSocket or chunked HTTP to backend.
 * 2. Speech-to-Text API:
 *    High-accuracy real-time transcription of classroom teacher's speech.
 * 3. English Sentence Segmentation:
 *    Natural language boundaries (punctuation, semantic clauses).
 * 4. Tamil Natural Translation:
 *    Colloquial & natural Tamil understanding optimized for student comprehension
 *    rather than mechanical dictionary translations.
 * 5. Key Concept & Vocabulary Extraction:
 *    Identify core STEM / academic terms students find challenging.
 * 6. Contextual Word Explanations:
 *    Tamil script, Tanglish phonetic guide, simplified English definition,
 *    and relatable real-world examples from everyday Tamil Nadu life.
 * 7. Frontend Dispatch:
 *    Pushes structured LessonSegment payload to UI components.
 * ============================================================================
 */

export const SAMPLE_LESSONS: LessonSegment[] = [
  {
    id: 'lesson-photosynthesis',
    topic: 'Biology • Plant Sciences',
    englishText:
      'Photosynthesis is the process by which green plants convert light energy into chemical energy.',
    tamilMeaning:
      'ஒளிச்சேர்க்கை என்பது பச்சைத் தாவரங்கள் சூரிய ஒளி ஆற்றலை வேதியியல் ஆற்றலாக மாற்றி உணவை உருவாக்கும் செயல்முறையாகும்.',
    tanglishMeaning:
      'Plants sunlight-a use panni food prepare panra natural process dhaan photosynthesis.',
    audioDurationSeconds: 6,
    importantWords: [
      {
        id: 'word-photosynthesis',
        word: 'Photosynthesis',
        tamilMeaning: 'ஒளிச்சேர்க்கை',
        tanglish: 'Oli serkkai',
        partOfSpeech: 'noun',
        explanation: 'The natural process plants use to produce food using sunlight, water, and air.',
        tamilExplanation: 'சூரிய ஒளி, நீர் மற்றும் காற்றைப் பயன்படுத்தி தாவரங்கள் உணவு தயாரிக்கும் முறை.',
        example: 'During the day, trees carry out photosynthesis and release fresh oxygen into the air.',
        tamilExample: 'பகல் நேரத்தில் மரங்கள் ஒளிச்சேர்க்கை செய்து தூய ஆக்சிஜனை காற்றில் வெளியிடுகின்றன.',
      },
      {
        id: 'word-process',
        word: 'process',
        tamilMeaning: 'செயல்முறை / படிமுறை',
        tanglish: 'Seyalmurai',
        partOfSpeech: 'noun',
        explanation: 'A series of steps or actions taken to achieve a specific result.',
        tamilExplanation: 'ஒரு குறிப்பிட்ட முடிவை அடைய படிப்படியாக செய்யப்படும் செயல்கள்.',
        example: 'Boiling water to make tea is a simple step-by-step process.',
        tamilExample: 'தேநீர் தயாரிப்பது ஒரு எளிய படிப்படியான செயல்முறை ஆகும்.',
      },
      {
        id: 'word-convert',
        word: 'convert',
        tamilMeaning: 'மாற்று / உருமாறுதல்',
        tanglish: 'Maathru / Maaruthal',
        partOfSpeech: 'verb',
        explanation: 'To change something completely from one state or form into another.',
        tamilExplanation: 'ஒரு பொருளை அல்லது ஆற்றலை வேறு ஒரு வடிவமாக மாற்றுவது.',
        example: 'Water can convert into solid ice when temperature drops below zero.',
        tamilExample: 'மிகவும் குளிராகும்போது தண்ணீர் பனிக்கட்டியாக மாறுகிறது.',
      },
      {
        id: 'word-chemical-energy',
        word: 'chemical energy',
        tamilMeaning: 'வேதியியல் ஆற்றல்',
        tanglish: 'Vedhiyal aatral',
        partOfSpeech: 'noun phrase',
        explanation: 'Energy stored in bonds of chemical compounds like food, fuels, and batteries.',
        tamilExplanation: 'உணவு, எரிபொருள் அல்லது பேட்டரிகளில் சேமித்து வைக்கப்பட்டுள்ள உள் ஆற்றல்.',
        example: 'Our body uses the chemical energy in our food to walk and study.',
        tamilExample: 'நாம் சாப்பிடும் உணவில் உள்ள வேதியியல் ஆற்றலை உடலானது வேலை செய்யப் பயன்படுத்துகிறது.',
      },
      {
        id: 'word-light-energy',
        word: 'light energy',
        tamilMeaning: 'ஒளி ஆற்றல்',
        tanglish: 'Oli aatral',
        partOfSpeech: 'noun phrase',
        explanation: 'The radiant energy produced by light sources such as the sun or lamps.',
        tamilExplanation: 'சூரியன் அல்லது மின்விளக்குகளில் இருந்து வெளிப்படும் பிரகாசமான ஆற்றல்.',
        example: 'Solar panels absorb light energy and produce electricity for homes.',
        tamilExample: 'சோலார் பேனல்கள் சூரியனின் ஒளி ஆற்றலை உறிஞ்சி வீடுகளுக்கான மின்சாரமாக மாற்றுகின்றன.',
      },
    ],
  },
  {
    id: 'lesson-gravity',
    topic: 'Physics • Classical Mechanics',
    englishText:
      'Gravity is an invisible pulling force that accelerates objects toward the center of the Earth.',
    tamilMeaning:
      'ஈர்ப்பு விசை என்பது பொருட்களை பூமியின் மையத்தை நோக்கி இழுத்து விரைவுபடுத்தும் ஒரு கண்ணுக்குத் தெரியாத விசையாகும்.',
    tanglishMeaning:
      'Bhoomi ella objects-aiyum adhan center-ukku keezhe pull panra invisible power dhaan gravity.',
    audioDurationSeconds: 7,
    importantWords: [
      {
        id: 'word-gravity',
        word: 'Gravity',
        tamilMeaning: 'ஈர்ப்பு விசை',
        tanglish: 'Eerppu visai',
        partOfSpeech: 'noun',
        explanation: 'The universal force that attracts any object with mass toward Earth.',
        tamilExplanation: 'பொருட்களை பூமியை நோக்கி இழுக்கும் இயற்கை விசை.',
        example: 'When you drop an apple from your hand, gravity pulls it straight down.',
        tamilExample: 'கையிலிருந்து ஆப்பிள் நழுவினால், ஈர்ப்பு விசை அதை நேரடியாக தரைக்கு இழுக்கிறது.',
      },
      {
        id: 'word-invisible',
        word: 'invisible',
        tamilMeaning: 'கண்ணுக்குத் தெரியாத',
        tanglish: 'Kannukku theriyaadha',
        partOfSpeech: 'adjective',
        explanation: 'Impossible to see with our naked eyes.',
        tamilExplanation: 'நமது கண்களால் நேரில் பார்க்க முடியாத ஒன்று.',
        example: 'Air and wind are invisible, yet we can easily feel their cooling breeze.',
        tamilExample: 'காற்று கண்ணுக்குத் தெரிவதில்லை, ஆனால் அதன் குளிர்ந்த தென்றலை உணர முடியும்.',
      },
      {
        id: 'word-accelerates',
        word: 'accelerates',
        tamilMeaning: 'வேகப்படுத்துகிறது',
        tanglish: 'Vegapaduthugiradhu',
        partOfSpeech: 'verb',
        explanation: 'Causes something to move faster and gain speed over time.',
        tamilExplanation: 'ஒரு பொருளின் வேகத்தை விரைவாக அதிகரிக்கச் செய்வது.',
        example: 'Pressing the gas pedal in a car accelerates the vehicle forward.',
        tamilExample: 'காரில் ஆக்ஸிலேட்டரை அழுத்தும்போது வண்டி முன்னோக்கி வேகம் பிடிக்கிறது.',
      },
    ],
  },
  {
    id: 'lesson-circulatory',
    topic: 'Human Anatomy • Biology',
    englishText:
      'The human heart pumps oxygen-rich blood continuously through blood vessels to nourish vital organs.',
    tamilMeaning:
      'மனித இதயம் நமது முக்கிய உடல் உறுப்புகளுக்கு ஊட்டமளிக்க இரத்த நாளங்கள் வழியாக ஆக்சிஜன் நிறைந்த இரத்தத்தை இடைவிடாமல் பம்ப் செய்கிறது.',
    tanglishMeaning:
      'Heart unstop-a thudichu pure blood-a body organs ellathukkum supply pannudhu.',
    audioDurationSeconds: 8,
    importantWords: [
      {
        id: 'word-pumps',
        word: 'pumps',
        tamilMeaning: 'பீய்ச்சியடிக்கிறது / அழுத்தி அனுப்புகிறது',
        tanglish: 'Pump seigiradhu',
        partOfSpeech: 'verb',
        explanation: 'Forces liquid or gas to move continuously through pipes or vessels.',
        tamilExplanation: 'திரவத்தை ஒரு குறிப்பிட்ட திசையில் அழுத்தத்துடன் பீய்ச்சி அனுப்புவது.',
        example: 'A water motor pumps water from the ground well up to the rooftop tank.',
        tamilExample: 'மோட்டார் கிணற்றில் இருந்து தண்ணீரை வீட்டின் மேல் தொட்டிக்கு பம்ப் செய்கிறது.',
      },
      {
        id: 'word-nourish',
        word: 'nourish',
        tamilMeaning: 'ஊட்டமளித்தல் / வளர்த்தல்',
        tanglish: 'Oottam alithal',
        partOfSpeech: 'verb',
        explanation: 'To supply with substances necessary for life, growth, and health.',
        tamilExplanation: 'உயிரோடு இருக்கவும் ஆரோக்கியமாக வளரவும் தேவையான சத்துக்களை வழங்குவது.',
        example: 'Fresh fruits and healthy greens nourish our body with essential vitamins.',
        tamilExample: 'பழங்களும் கீரைகளும் நமது உடலுக்கு தேவையான சத்துக்களை வழங்கி ஊட்டமளிக்கின்றன.',
      },
      {
        id: 'word-vital-organs',
        word: 'vital organs',
        tamilMeaning: 'முக்கிய உடல் உறுப்புகள்',
        tanglish: 'Mukkiya udal uruppugal',
        partOfSpeech: 'noun phrase',
        explanation: 'Crucial body parts like the brain, heart, and lungs needed to stay alive.',
        tamilExplanation: 'மூளை, இதயம், நுரையீரல் போன்ற மனிதன் உயிர்வாழ மிக அவசியமான உறுப்புகள்.',
        example: 'Wearing a helmet while riding protects your brain, one of our vital organs.',
        tamilExample: 'தலைக்கவசம் அணிவது நமது முக்கிய உறுப்பான மூளையை பாதுகாக்கிறது.',
      },
    ],
  },
];

export interface LearningService {
  processAudioLesson(audioBlob: Blob, targetLessonIndex?: number): Promise<LessonSegment>;
  getLessonByIndex(index: number): LessonSegment;
  getAllLessons(): LessonSegment[];
}

class LearningServiceImpl implements LearningService {
  private lessonIndex = 0;

  getAllLessons(): LessonSegment[] {
    return SAMPLE_LESSONS;
  }

  getLessonByIndex(index: number): LessonSegment {
    const safeIndex = Math.abs(index) % SAMPLE_LESSONS.length;
    return SAMPLE_LESSONS[safeIndex];
  }

  async processAudioLesson(audioBlob: Blob, targetLessonIndex?: number): Promise<LessonSegment> {
    // 1. Maintain the existing speechToTextService call contract
    await speechToTextService.transcribeAudio(audioBlob, 'ta-IN');

    // 2. Select next structured lesson or user-specified index
    const index =
      targetLessonIndex !== undefined ? targetLessonIndex : this.lessonIndex % SAMPLE_LESSONS.length;
    this.lessonIndex++;

    const chosenLesson = SAMPLE_LESSONS[index % SAMPLE_LESSONS.length];

    // Simulates dynamic metadata payload
    return {
      ...chosenLesson,
      audioDurationSeconds: Math.max(3, Math.round(audioBlob.size / 18000)) || chosenLesson.audioDurationSeconds,
      timestamp: Date.now(),
    };
  }
}

export const learningService = new LearningServiceImpl();
