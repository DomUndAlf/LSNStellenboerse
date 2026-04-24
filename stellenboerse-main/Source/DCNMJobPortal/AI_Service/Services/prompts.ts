export const URL_CLASSIFICATION_PROMPT: string = `Analyze the content and classify it strictly as either "job" or "other". A job posting must include:
      - A specific job title (e.g., "Software Engineer," "Sales Manager", "PhD positions", "Professorship", "Professur", "W2-Professur", "W3-Professur")
      - Detailed job description with specific responsibilities or requirements, possibly including required skills or experience
      - Information about benefits, location, employment type, or salary
      - Employment details (e.g., full-time, part-time, office location, "unbefristet", "befristet")
      - Explicit application instructions (e.g., "Apply now," "Jetzt bewerben", contact details, or application link)

      IMPORTANT: Academic positions like Professorships, Chairs, Faculty positions, Habilitation positions, and tenure-track positions ARE job postings if they include application instructions.

      IMPORTANT: Fellowships, Scholarships, Stipends, Research Fellowships, Visiting Fellowships, and similar funding programs for researchers or scholars ARE job postings if they include application deadlines and application instructions. Examples include "Research Fellowship", "Visiting Fellowship", "Stipendium", "Promotionsstipendium", "Förderprogramm", "Leo Baeck Fellowship", "Call for Applications".

      IMPORTANT: Thesis topics and student research opportunities ARE job postings. This includes:
      - Master thesis topics ("Masterarbeit", "Master Thesis", "M.Sc. Thesis")
      - Bachelor thesis topics ("Bachelorarbeit", "Bachelor Thesis", "B.Sc. Thesis")
      - Diploma thesis topics ("Diplomarbeit")
      - Student research projects with specific topics
      - PDFs or pages describing available thesis topics with contact information for supervisors
      If a document describes a specific research topic that a student can work on as their thesis, classify it as "job".

      Pages that are general, informational, or academic, such as those discussing environmental topics, research projects, or institutional goals, should be classified as "other." For example:
      - Topics like "Environmental Research," "Chemicals in the Environment," or "Research Projects" should be classified as "other."

      The score provided indicates how likely the content is to be job-related:
      - A score above 3 suggests the page is likely job-related.
      - A score between 1 and 3 indicates moderate job relevance and requires close inspection.
      - A score below 1 suggests the page is unlikely to be job-related.

      This webpage is {isLikelyJob} a job posting based on its URL structure and has a job-related score of {score}. Use both the URL likelihood and score ranges above to guide your classification, responding with "job" only if it unmistakably matches a job posting as per the above criteria; otherwise, respond with "other".`;

export const PLAIN_TEXT_TITEL_EXTRACTION: string =
  "You are a specialized tool for extracting job titles from pre-filtered text. Your task is to extract the job title exactly as it appears in the text, 1:1.\n\n" +
  "Instructions:\n" +
  "1. Ignore any content that is not directly related to the title.\n" +
  "2. Extract the title exactly as it is presented (including capitalization, special characters, and formatting).\n" +
  "3. Avoid interpreting or changing the content; only provide the text that explicitly appears as the title.\n" +
  "4. Double-check that the extracted text is exclusively the job title.\n\n" +
  "Input:\n" +
  "Here is the pre-filtered text:\n\n" +
  "Output:\n" +
  "Only the exact job title as it appears in the text, without any additional text or characters.\n\n" +
  "Example:\n" +
  "Input:\n" +
  "PhD positions at the IMPRS “The Leipzig School of Human Origins” in Leipzig, Germany\n\n" +
  "Output:\n" +
  '{"Job": { "jobTitle": "PhD positions at the IMPRS “The Leipzig School of Human Origins” in Leipzig, Germany"}}\n\n';

export const PLAIN_TEXT_TASK_EXTRACTION: string = `
  You are a specialized AI tool for extracting tasks or assignments from a given job advertisement text. Follow the instructions carefully and ensure the result adheres strictly to the specified conditions.
  
  ### General Instructions:
  1. First, check if the input contains HTML tags (e.g. <div>, <ul>, <li>). If yes, apply the rules for HTML task extraction.
  2. If the input does NOT contain HTML tags, apply the rules for plain text extraction.
  3. Always return a valid JSON object or null based on the rules.
  
  ### Instructions:
  1. **Task Identification:**
     - Look only for tasks explicitly listed within <ul> and <li> tags in the provided text.
     - If <li> tags contain information about job responsibilities or tasks, extract and include them in the "tasks" array, preserving their content and order exactly as written.
     - If <li> tags are nested (e.g., <ul><li><ul><li>...), extract all nested items and treat them as individual tasks.
  
  2. **Exceptions to Task Identification:**
     - DO NOT include tasks described only in plain text (i.e., tasks not within <ul> or <li> tags).
     - only extract elements in one language
     - Ignore <li> lists that describe:
       - Required skills or qualifications (e.g., "Ihr Profil", "what we expect").
       - Benefits or offerings from the employer (e.g., "Wir bieten", "what we provide").
       - Other non-task-related information such as application requirements etc.
  
  3. **Null Conditions:**
     - Return null if:
       - The text does not contain <ul> and <li> tags.
       - All <li> tags contain irrelevant information (e.g., benefits, requirements, etc.).
       - All tasks are described in plain text outside of <li> tags.
  
  ### Output Requirements:
  - Always return a valid JSON object or null.
  - Do not modify the content or order of any extracted tasks.
  - Strictly adhere to the specified format and rules.
  
  ### Example Outputs:
  #### Input with no tasks:
  <p>We are looking for someone with great skills in...</p>
  <ul>
    <li>Benefits: A competitive salary</li>
    <li>Your Profile: At least 3 years of experience</li>
  </ul>
  **Output:**
  null
  
  #### Input with tasks:
  <ul>
    <li>Task 1: Manage the project timeline.</li>
    <li>Task 2: Coordinate team meetings.</li>
  </ul>
  **Output:**
  {
    "tasks": [
      "Manage project timelines.",
      "Coordinate team meetings."
    ]
  }
  
  #### Plain Text Input with Irrelevant Information:
  Input:
  - What we offer: Competitive salary.
  - Your profile: At least 3 years of experience.
  
  Output:
  null
  
  #### HTML Input with Tasks:
  Input:
  <ul>
    <li>Task 1: Manage project timeline.</li>
    <li>Task 2: Coordinate team meetings.</li>
  </ul>
  
  Output:
  {
    "tasks": [
      "Task 1: Manage project timeline.",
      "Task 2: Coordinate team meetings."
    ]
  }
  
  #### HTML Input with Irrelevant Information:
  Input:
  <ul>
    <li>Benefits: Competitive salary.</li>
    <li>Your Profile: At least 3 years of experience.</li>
  </ul>
  
  Output:

  #### Input in plain text or full sentences without <li> tags:
  Der/die Volontär/-in wird in die unterschiedlichen Aufgabenfelder der Museumsarbeit eingeführt, um Kenntnisse, Fertigkeiten und Erfahrungen für eine berufliche Tä</tigkeit im Museum mit dem Schwerpunkt Presse- und Öffentlichkeitsarbeit zu erwerben.
   **Output:**
  null
  `;

export const PLAIN_TEXT_DESCRIPTION_EXTRACT: string =
  "You are a specialized tool for extracting the job description from pre-filtered HTML text. Your task is to identify description information from the following job advertisement text and output the result in the following JSON format:\n\n" +
  '{\n  "description": "This field contains the job or project description."\n}\n\n' +
  "Follow these strict rules:\n\n" +
  "1. **Description (Field: description):**\n" +
  "   - **Content Order:**\n" +
  '     1. If the text includes a description of the institute (e.g., "UFZ", "Max Planck", "Fraunhofer-Gesellschaft", "Leibniz-Institut", "HTWK Leipzig", "Stadtverwaltung Leipzig"), copy this section verbatim into the "description" field.\n' +
  '     2. After the institute description, if there is a general full-text description of the position to be filled, copy this section verbatim into the "description" field.\n' +
  '     3. If tasks are described in textform, include these at the end of the "description" field.\n' +
  "   - **Important Notes:**\n" +
  "     - Keep distinct thematic sections separate and unaltered.\n" +
  '     - Do not include headlines (e.g., "The Offer:" or "The Position:").\n' +
  "     - Do not remove or add punctuation (e.g., periods, spaces, commas, colons).\n\n" +
  "2. **Exclusions:**\n" +
  "   - Do not include sections about job requirements, payment, benefits, equality procedures, or the hiring process.\n\n" +
  "3. **Edge Cases:**\n" +
  '   - without a general description, return: \n   {\n       "description": ""\n     }\n.\n' +
  "4. **Integrity and Output Format:**\n" +
  "   - Always return a valid JSON object.\n" +
  "   - If no relevant description is found, return:\n" +
  '     {\n       "description": ""  n     }\n\n' +
  "### Examples:\n\n" +
  'Input 1:\n"The UFZ is a leading research center focusing on environmental sciences. This position involves interdisciplinary research to assess climate change impacts."\n' +
  'Output:\n{\n  "description": "The UFZ is a leading research center focusing on environmental sciences. This position involves interdisciplinary research to assess climate change impacts."\n}\n\n' +
  'Input 2:\n"Unsere Erwartungen:\n- Erstellung von Bedarfsmeldungen\n- Kontrolle der Wareneingänge"\n' +
  'Output:\n{\n  "description": null\n}\n\n' +
  'Input 3:\n"Fraunhofer-Gesellschaft conducts applied research. This role focuses on software development in artificial intelligence."\n' +
  'Output:\n{\n  "description": "Fraunhofer-Gesellschaft conducts applied research. This role focuses on software development in artificial intelligence."\n}\n\n' +
  "Strictly adhere to these rules and examples to produce accurate and structured output in the required format.";

export function descriptionFindErrorPrompt(
  bodyText: string,
  extraction: string,
  prompt: string,
): string {
  return `You are an advanced language model tasked with analyzing text extraction results for accuracy.
  
  Below is the provided body text:
  ${bodyText}
  
  Here is the extracted result:
  ${extraction}
  
  The following prompt was used to generate the extraction:
  ${prompt}
  
  Your task is to evaluate whether the extracted result aligns with the rules and instructions specified in the prompt. If the result deviates from these rules, provide a detailed explanation of the discrepancies, including specific examples and references to the text or the rules in the prompt. Ensure your explanation is clear and actionable so that any errors can be effectively corrected.`;
}

export function correctionPrompt(
  bodyText: string,
  extraction: string,
  explanation: string,
): string {
  return `You are an advanced language model tasked with correcting extraction errors based on a provided explanation.
  
  Below is the provided body text:
  ${bodyText}
  
  Here is the extracted result:
  ${extraction}
  
  Here is the explanation of the errors in the extraction:
  ${explanation}
  
  Your task is to correct the extracted result so that it adheres strictly to the rules and instructions from the original prompt. Ensure that your corrected result is accurate, concise, and meets all specified requirements.`;
}

export const PLAIN_TEXT_DEADLINE_EXTRACT: string =
  "You are a specialized tool for extracting application deadlines from pre-filtered text. Your task is to identify and extract ONLY explicitly mentioned application deadlines from the text. Follow these strict rules:\n\n" +
  "1. Only extract dates that are EXPLICITLY labeled as application deadlines, closing dates, or submission deadlines\n" +
  "2. If found, convert the deadline to ISO date format (YYYY-MM-DD)\n" +
  "3. Return null if:\n" +
  "   - No deadline is explicitly mentioned\n" +
  "   - The text only contains dates without clear indication they are application deadlines\n" +
  "   - The deadline is described as 'ongoing', 'as soon as possible', or 'until filled'\n" +
  "   - The deadline is in the past\n\n" +
  "Desired format:\n" +
  '{"applicationDeadline": "YYYY-MM-DD"} or {"applicationDeadline": null}\n\n' +
  "Examples:\n" +
  "Input: Applications must be submitted by November 15, 2024.\n" +
  'Output: {"applicationDeadline": "2024-11-15"}\n\n' +
  "Input: The position starts on January 1, 2024.\n" +
  'Output: {"applicationDeadline": null}\n\n' +
  "Input: Application deadline: 15.03.2024\n" +
  'Output: {"applicationDeadline": "2024-03-15"}\n\n' +
  "Input: The project runs from 2024 to 2026.\n" +
  'Output: {"applicationDeadline": null}"';
"Input: Vertragslaufzeit bis 31.3.2025.\n" + 'Output: {"applicationDeadline": null}"';

export const PLAIN_TEXT_LANGUAGE_EXTRACT: string =
  "Detect if the job title is in German (de) or English (en). Return the language code.\n\n" +
  "Examples:\n" +
  'Input: "Software Entwickler (m/w/d) für Backend"\n' +
  'Output: {"language": "de"}\n\n' +
  'Input: "Senior Software Engineer for Cloud Infrastructure"\n' +
  'Output: {"language": "en"}\n\n' +
  'Input: "Werkstudent Marketing"\n' +
  'Output: {"language": "de"}\n\n' +
  'Input: "Marketing Working Student"\n' +
  'Output: {"language": "en"}';

export const PLAIN_TEXT_SPECIALTY_EXTRACT: string = `
  You are an AI tool specialized in assigning specialties to a given job description. The specialties should only be selected from a predefined array of specialties. A job can have multiple specialties. Return the specialties in alpahabetical order.
  Important: If the job description does not match any of the predefined specialties, return an "Andere" as its specialty.

  ### Predefined Specialties:
  - Geistes- und Sozialwissenschaften
  - Ingenieurwissenschaften
  - Kultur, Kunst, Musik
  - Medizin, Gesundheit, Psychologie
  - MINT
  - Rechtswissenschaften
  - Wirtschaftswissenschaften
  - Nicht-wissenschaftliche Berufe

  ### Instructions:
  - Analyze the given job description.
  - Assign the relevant specialties ONLY from the predefined array.
  - Ensure the result adheres strictly to the specified JSON format.
  - If no matching specialty is found, assign "Andere" as the specialty.

  ### Expected Output:
  - The output must be in the following JSON format:
  {
    "specialty": [
      "Specialty 1",
      "Specialty 2"
    ]
  }

  ### Examples:
  Input: "We are looking for a software engineer with a background in computer science and engineering."
  Output: {"specialty": ["Ingenieurwissenschaften", "MINT"]}

  Input: "The candidate should have expertise in chemistry, medicine and engineering."
  Output: {"specialty": ["Ingenieurwissenschaften", "Medizin, Gesundheit, Psychologie", "MINT"]}
  
  Input: "We are looking for someone who will help out in the cafeteria"
  Output: {"specialty": ["Nicht-wissenschaftliche Berufe"]}

  Input: "This is an announcement for a bachelor's thesis in interdisciplinary fields that do not align with specific disciplines."
  Output: {"specialty": ["Andere"]}
`;
