// Burns Depression Checklist (25-item version), from David D. Burns,
// "The Feeling Good Handbook". Each item is rated 0–4, for a total of 0–100.

export const SECTIONS = [
  {
    id: "thoughts",
    title: "Thoughts and feelings",
    items: [
      "Feeling sad or down in the dumps",
      "Feeling unhappy or blue",
      "Crying spells or tearfulness",
      "Feeling discouraged",
      "Feeling hopeless",
      "Low self-esteem",
      "Feeling worthless or inadequate",
      "Guilt or shame",
      "Criticizing yourself or blaming others",
      "Difficulty making decisions",
    ],
  },
  {
    id: "activities",
    title: "Activities and personal relationships",
    items: [
      "Loss of interest in family, friends or colleagues",
      "Loneliness",
      "Spending less time with family or friends",
      "Loss of motivation",
      "Loss of interest in work or other activities",
      "Avoiding work or other activities",
      "Loss of pleasure or satisfaction in life",
    ],
  },
  {
    id: "physical",
    title: "Physical symptoms",
    items: [
      "Feeling tired",
      "Difficulty sleeping or sleeping too much",
      "Decreased or increased appetite",
      "Loss of interest in sex",
      "Worrying about your health",
    ],
  },
  {
    id: "suicidal",
    title: "Suicidal urges",
    items: [
      "Do you have any suicidal thoughts?",
      "Would you like to end your life?",
      "Do you have a plan for harming yourself?",
    ],
  },
];

export const QUESTIONS = SECTIONS.flatMap((section) =>
  section.items.map((text) => ({ text, section: section.id }))
);

export const OPTIONS = ["Not at all", "Somewhat", "Moderately", "A lot", "Extremely"];

export const MAX_SCORE = QUESTIONS.length * (OPTIONS.length - 1);

export const BANDS = [
  { max: 5, label: "No depression", tone: "Your answers suggest you're not depressed right now." },
  { max: 10, label: "Normal but unhappy", tone: "You may be going through a rough patch, which is a normal part of life." },
  { max: 25, label: "Mild depression", tone: "Your answers suggest mild depression." },
  { max: 50, label: "Moderate depression", tone: "Your answers suggest moderate depression." },
  { max: 75, label: "Severe depression", tone: "Your answers suggest severe depression." },
  { max: 100, label: "Extreme depression", tone: "Your answers suggest extreme depression." },
];

export function bandFor(score) {
  return BANDS.find((band) => score <= band.max);
}
