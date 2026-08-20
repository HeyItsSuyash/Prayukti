# Prayukti vLAB - Teacher Dashboard, Smart Classes & AI Questions

Define the teacher experience around three tightly connected components: **Teacher Dashboard, Smart Classes, and AI Question Generation**.

## 1. Teacher Dashboard

The Teacher Dashboard is the teacher's control center.

It should provide:

* Overview of the teacher's assigned subjects, classes, and sections.
* Upcoming and currently scheduled classes.
* Quick access to today's Smart Classes.
* Recent announcements and classroom activity.
* Student participation and engagement summaries.
* Attendance information for assigned classes.
* Pending quizzes/assessments.
* Recently created quizzes.
* Quick action to create a quiz from a resource.
* Quick action to start or schedule a Smart Class.
* Quick access to teaching resources.

The dashboard should act primarily as an **entry point and monitoring layer**. Detailed teaching actions should happen inside Smart Classes or the relevant feature.

---

## 2. Smart Classes

Smart Classes represent an actual teaching session.

A Smart Class is associated with:

* Teacher
* Subject
* Section/class
* Scheduled time
* Duration
* Optional classroom/meeting link
* Teaching resources
* Announcements
* Activities/quizzes

A teacher should be able to:

* Create or schedule a class.
* Select the subject and section.
* Attach existing resources.
* Add or upload teaching resources.
* Share resources with students.
* Create an announcement for the class.
* Launch a live class.
* Start a quiz during the class.
* View student participation.
* View quiz responses while the class is running.
* End the class and retain its activity/results.

### Resource-driven teaching

Resources attached to a Smart Class become available to the teacher as potential sources for AI question generation.

For example:

Teacher creates:

**Computer Networks - ARP & RARP**

Attaches:

`ARP.pdf`

The teacher can then select that resource and choose:

**Generate Questions**

The AI uses the contents of that resource as the question-generation context.

---

## 3. AI Question Generation

Question generation should be intentionally simple.

The teacher does not need to manually provide a topic, syllabus, or detailed prompt.

The teacher:

1. Selects a resource.
2. Specifies the number of questions.
3. Selects the question type.
4. Selects difficulty.
5. Generates questions.

Supported resources can include:

* PDF
* Notes/document
* Presentation
* Video/resource link
* Existing Prayukti experiment content

The system extracts the relevant content from the selected resource and sends that context to the AI.

The AI generates structured questions containing:

* Question
* Options where applicable
* Correct answer
* Explanation
* Difficulty
* Source/context reference

The teacher reviews the generated questions before they become available to students.

The teacher can:

* Edit a question.
* Regenerate an individual question.
* Delete a question.
* Add a question manually.
* Change the correct answer.
* Reorder questions.
* Approve the complete quiz.

AI-generated questions should remain **drafts until the teacher approves them**.

---

# How the Three Components Work Together

The relationship should be:

**Teacher Dashboard → Smart Class → Resource → AI Question Generator → Quiz → Students → Results → Teacher Dashboard**

### Example workflow

A teacher opens the dashboard.

They see:

**Today's Class**
`Computer Networks - Section CSE-B`

They open the Smart Class.

The teacher attaches:

`Computer Networks Unit 2.pdf`

During preparation, they select:

**Generate Quiz**

The system uses the attached resource as context.

The teacher requests:

`10 MCQs - Mixed Difficulty`

AI generates the questions.

The teacher reviews and approves them.

The quiz is now associated with that Smart Class.

When the teacher starts the Smart Class, they can launch:

**Start Quiz**

Students in that section receive the quiz.

Students answer the questions.

The system records:

* Responses
* Correct/incorrect answers
* Score
* Completion
* Participation
* Time taken

The teacher can see the live or completed results from the Smart Class.

After the class, the resulting participation and assessment information becomes part of the teacher's dashboard data.

---

# Core Relationship

The three components should therefore have clearly defined responsibilities:

### Teacher Dashboard

**"What is happening?"**

Monitoring, shortcuts, upcoming classes, student activity, quizzes and results.

### Smart Classes

**"What am I teaching right now?"**

Classes, resources, announcements, live teaching and classroom activities.

### AI Question Generation

**"How do I quickly create an activity from what I am teaching?"**

Select resource → generate → review → publish → run in Smart Class.

The AI question generator should not become a separate LMS. It is an **activity-generation capability inside the teaching workflow**.

The central idea is:

**Teachers teach from resources.
AI turns those resources into questions.
Smart Classes deliver those questions to students.
Student responses return to the teacher as classroom feedback.**
