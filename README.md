## WiNG.it - Career Readiness Coach

### What is WiNG.it
WiNG.it is a tool that helps students build career readiness by allowing them to practice professional communication using AI-powered adaptive and reflective mock interview scenarios.

### Abstract
WiNG.it is an innovative career readiness tool designed to empower students across all stages of their education, whether it’s students applying to universities or college students entering the workforce. The platform addresses the critical challenges faced by job seekers today, including limited access to high-quality interview practice, lack of personalized performance feedback, and the time-consuming process of identifying suitable job opportunities that align with their skills and career goals.

The core functionality of WiNG.it currently centers on behavioral interview practice. Students can engage in simulated interviews with a virtual human and receive AI-powered feedback on their communication style, content quality, and overall performance in a judgement free zone. Detailed transcripts and performance metrics allow students to track progress over time, while personalized improvement suggestions guide continuous skill development.

In upcoming phases, WiNG.it will expand with a gamified job conference simulation, where students will navigate a virtual environment simulating real-life recruiter interactions. This tool will allow students to refine their conversational and interpersonal skills, while simultaneously reducing anxiety and ensuring authenticity. We also plan to implement a “small talk” simulator, designed to help students build confidence in either informal or formal professional interactions. These tools will not only help our students connect naturally and cultivate social fluency within real-world scenarios, but also become more confident and effective communicators gaining professional competencies. 

What sets WiNG.it apart is its student-centered design. WiNG.it was initially started as a hackathon project, after a bad interview experience from one of the team members due to the lack of in-depth career preparation tools available online. The application is designed with students in mind first ensuring that the tool resonates with students. Ultimately, WiNG.it seeks to support career readiness by making personalized coaching accessible to all, helping students achieve tangible outcomes - better interview performance, faster job placement, and more strategic career growth while harnessing technology to deliver these benefits at scale.

### Research and Development
WiNG.it applies learning engineering principles to help students build and track career readiness skills through authentic, AI-guided practice. Each student interaction such as interview responses, small talk exercises, reflection prompts, and feedback are stored in a Firebase database. Additionally, this data is used to generate structured insights on students’ development of professional competencies defined by the National Association of Colleges and Employers (NACE) such as critical thinking and communication. The data also powers continuous personalization, allowing the system to adapt feedback and challenges to each student’s progress. By aligning practice with NACE competencies, WiNG.it translates learning data into actionable guidance students can use to strengthen their professional skills. This approach creates a continuous improvement loop where students learn, receive feedback, and see measurable growth making career readiness more transparent, data-driven, and accessible.




## Deploying Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


Backend: Backend powered by Google Cloud Functions (Firebase)
To update functions in the cloud:
```bash
//Note this is an example of updating a cloud function, make sure you are logged in first
firebase functions:delete saveResponse 
firebase deploy --only functions:saveResponse
```

🎉 Check out our deployment at https://wing-it.space/! 🎉

