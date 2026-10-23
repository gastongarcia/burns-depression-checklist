// Burns Depression Checklist (25 items), by David D. Burns, MD.
// English wording, scale labels and score levels match the published form.
// The Spanish text is our own translation, not an official one.

export const LANGS = ["en", "es"];

const SECTION_IDS = ["thoughts", "activities", "physical", "suicidal"];

const CONTENT = {
  en: {
    sections: {
      thoughts: "Thoughts and Feelings",
      activities: "Activities and Personal Relationships",
      physical: "Physical Symptoms",
      suicidal: "Suicidal Urges",
    },
    items: [
      ["thoughts", "Feeling sad or down in the dumps"],
      ["thoughts", "Feeling unhappy or blue"],
      ["thoughts", "Crying spells or tearfulness"],
      ["thoughts", "Feeling discouraged"],
      ["thoughts", "Feeling hopeless"],
      ["thoughts", "Low self-esteem"],
      ["thoughts", "Feeling worthless or inadequate"],
      ["thoughts", "Guilt or shame"],
      ["thoughts", "Criticizing yourself or blaming others"],
      ["thoughts", "Difficulty making decisions"],
      ["activities", "Loss of interest in family, friends or colleagues"],
      ["activities", "Loneliness"],
      ["activities", "Spending less time with family or friends"],
      ["activities", "Loss of motivation"],
      ["activities", "Loss of interest in work or other activities"],
      ["activities", "Avoiding work or other activities"],
      ["activities", "Loss of pleasure or satisfaction in life"],
      ["physical", "Feeling tired"],
      ["physical", "Difficulty sleeping or sleeping too much"],
      ["physical", "Decreased or increased appetite"],
      ["physical", "Loss of interest in sex"],
      ["physical", "Worrying about your health"],
      ["suicidal", "Do you have any suicidal thoughts?"],
      ["suicidal", "Would you like to end your life?"],
      ["suicidal", "Do you have a plan for harming yourself?"],
    ],
    options: ["Not at all", "Somewhat", "Moderately", "A lot", "Extremely"],
    bands: ["No depression", "Normal but unhappy", "Mild depression", "Moderate depression", "Severe depression", "Extreme depression"],
  },
  es: {
    sections: {
      thoughts: "Pensamientos y sentimientos",
      activities: "Actividades y relaciones personales",
      physical: "Síntomas físicos",
      suicidal: "Impulsos suicidas",
    },
    items: [
      ["thoughts", "Sentirse triste o decaído(a)"],
      ["thoughts", "Sentirse infeliz o melancólico(a)"],
      ["thoughts", "Episodios de llanto o ganas de llorar"],
      ["thoughts", "Sentirse desanimado(a)"],
      ["thoughts", "Sentirse sin esperanza"],
      ["thoughts", "Baja autoestima"],
      ["thoughts", "Sentirse sin valor o insuficiente"],
      ["thoughts", "Culpa o vergüenza"],
      ["thoughts", "Criticarse a sí mismo(a) o culpar a los demás"],
      ["thoughts", "Dificultad para tomar decisiones"],
      ["activities", "Pérdida de interés en la familia, los amigos o los compañeros de trabajo"],
      ["activities", "Soledad"],
      ["activities", "Pasar menos tiempo con la familia o los amigos"],
      ["activities", "Pérdida de motivación"],
      ["activities", "Pérdida de interés en el trabajo u otras actividades"],
      ["activities", "Evitar el trabajo u otras actividades"],
      ["activities", "Pérdida de placer o satisfacción en la vida"],
      ["physical", "Sentirse cansado(a)"],
      ["physical", "Dificultad para dormir o dormir demasiado"],
      ["physical", "Disminución o aumento del apetito"],
      ["physical", "Pérdida de interés en el sexo"],
      ["physical", "Preocupación por su salud"],
      ["suicidal", "¿Tiene pensamientos suicidas?"],
      ["suicidal", "¿Le gustaría terminar con su vida?"],
      ["suicidal", "¿Tiene un plan para hacerse daño?"],
    ],
    options: ["Nada", "Algo", "Moderadamente", "Mucho", "Extremadamente"],
    bands: ["Sin depresión", "Normal pero infeliz", "Depresión leve", "Depresión moderada", "Depresión grave", "Depresión extrema"],
  },
};

// Upper bound of each score level on the published scoring key.
const BAND_MAX = [5, 10, 25, 50, 75, 100];

export const QUESTION_COUNT = CONTENT.en.items.length;
export const OPTION_COUNT = CONTENT.en.options.length;
export const MAX_SCORE = QUESTION_COUNT * (OPTION_COUNT - 1);

export function checklist(lang) {
  const c = CONTENT[lang] ?? CONTENT.en;
  const questions = c.items.map(([section, text]) => ({ section, text }));
  const sections = SECTION_IDS.map((id) => ({
    id,
    title: c.sections[id],
    items: questions.filter((q) => q.section === id).map((q) => q.text),
  }));
  const bands = BAND_MAX.map((max, i) => ({ max, min: i === 0 ? 0 : BAND_MAX[i - 1] + 1, label: c.bands[i] }));
  return { questions, sections, options: c.options, bands };
}

export function bandIndex(score) {
  return BAND_MAX.findIndex((max) => score <= max);
}
