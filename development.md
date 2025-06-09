
Jak wygladała praca z AI:

### 1. Wygenerowałem plan pracy
   
```
I have to prepare an assignment from a sibject called "aritificial intelligence"

this is the message with task I received:

Proszę o projekt pobieram dane z IoT i automatycznie przetwarzam je za pomocą systemu opracowanego z wykorzystaniem wtyczki Cline np dla danych stanu kolejek w SOR

First of all, how do you understand this assignment?

Am I right in saying that what has to be done is:

create a mock API with the iot data -- return static or random data from it
create the actual server implementation that will collect, analyze and present the data? possibly also predict?
```

### Odpowiedz:
```
I'll help you understand this assignment and outline a plan based on the Polish instructions provided.

The assignment roughly translates to: "Please create a project that collects data from IoT and automatically processes them using a system developed with the Cline plugin, for example, for queue status data in the Emergency Room (SOR - Szpitalny Oddział Ratunkowy)."

Your understanding is on the right track, but let me clarify and expand on it:

Assignment Understanding
This project requires you to:

Simulate or collect IoT data (in this case, related to hospital emergency room queue status)
Process this data automatically using a system built with the "Cline" plugin
Analyze and visualize the processed data
Possibly implement predictive analytics for queue management
Project Components
Your approach needs some refinement:

IoT Data Source:

Create a simulated IoT data source (you're correct that this could be a mock API)
The data should represent queue statuses in an emergency room
Processing System:

Build a system using the Cline plugin (I should find out what this is)
Process and analyze the collected data
Visualization/UI:

Present the processed data in a meaningful way
Display analytics and insights
Predictive Component:

Optionally add predictive algorithms to forecast queue statuses
Let me search for information about this "Cline plugin" to better understand what technology you need to use.

Now I understand that "Cline" refers to a VS Code extension that helps with coding tasks using AI models like Claude. Let's look for more information about IoT solutions and emergency room queue systems to better guide you.

Searched codebase for "IoT hospital emergency room queue management system", no results

Based on my search results and understanding of the assignment, here's my interpretation:

Assignment Understanding
The task requires you to create a system that:

Collects data from IoT devices (related to emergency room queues)
Processes this data automatically using a system developed with the Cline extension
Analyzes and presents this data in a meaningful way
Potentially includes predictive analytics for queue management
Your interpretation is mostly correct, but with some refinements:

IoT Data Source: You need to create a system that simulates IoT devices that would be found in a hospital emergency room (SOR) environment. This could include sensors for tracking:

Patient wait times
Queue lengths
Room occupancy
Staff availability
Equipment status
Processing System: The system should process this data using capabilities from Cline, which is an AI-powered VS Code extension that can help you develop your solution.

Analysis & Visualization: Build a component to analyze the collected data and present insights through a dashboard or interface.

Predictive Component: Include algorithms to predict future queue states based on historical data.

Project Plan
Here's a recommended approach for this project:

Create a Mock IoT Data Generator:

Simulate sensors in an emergency room environment
Generate realistic data about patient queues, wait times, etc.
Build a Data Collection Server:

Create an API endpoint to receive data from the simulated IoT devices
Store the data in a database for processing
Develop Data Processing Logic:

Implement algorithms to analyze queue data
Extract insights like average wait times, peak hours, etc.
Build predictive models to forecast future queue states
Create a Dashboard:

Visualize the current and historical queue data
Display predictions and recommendations
Provide real-time alerts for critical situations
Documentation:

Explain how the system works
Describe how Cline was used in development
Would you like me to help you start on any particular part of this project? I can help you set up the mock IoT data generator, the server, or any other component.
```

### 2. Dodałem zmiany po przeanalizowaniu zaproponowanego planu. (pominąłem 2 pośrednie odpowiedzi)

#### Poprawka 1.
```
I don't actually care about Cline and would rather use copilot.

Would you say it will be possible to do some predictions with a series prediction model like amazon/chronos-bolt-tiny?

here are its specs
Model size
8.65M params
Tensor type
F32
```
#### Poprawka 2.
```
would it be possible to easily integrate with huggingface in order to run this model via javascript? ideally I'd like to create this project using fastify

lets skip the SQL for now and instead of services using SQL, make them in memory (but still extract common interfaces so that the implementation can be simply swapped later).

Create for me an extensive summary of the plan and what has to be done so that I can copy and paste it to a new copilot session whenever we create a component
```
#### Poprawka 3.
```
update the plan to use bun commands instead of npm and also use typescript. then output it into readme. The plan looks good so keep it as a whole, epsecially the implementation steps.
```

### Plan ostateczny

### 3. Praca z kodem

Aby wykonać ten projekt, uzywałem wygenerowanego planu jako kontekst dla nowych sesji agenta, które były tworzone na potrzeby kazdej kolejnej fazy implementacji. 

### 4. Napotkane problemy

Agent nie poradził sobie z wykorzystaniem modelu chronos do przewidywana przyszłych wartości. Wynika to z faktu, ze zadna dostepna biblioteka webowa nie wspiera uruchamiania modeli "Time series" przez ich specyficzny format. Koniec końców kazałem agentowi zastąpić modelu zwykłymi obliczeniami statystycznymi na potrzeby MVP:q:

```
remove chronos prediction service and replace it with a service that does the forecasting via code, add a TODO to replace with a time series forecasting model
```

### 5. Podgląd czesći pracy

![](imgs/Screenshot%202025-06-09%20at%2012.45.06.png)

![](imgs/Screenshot%202025-06-09%20at%2012.45.18.png)

![](imgs/Screenshot%202025-06-09%20at%2012.45.33.png)

![](imgs/Screenshot%202025-06-09%20at%2012.45.45.png)

![](imgs/Screenshot%202025-06-09%20at%2012.46.04.png)

![](imgs/Screenshot%202025-06-09%20at%2012.46.23.png)

![](imgs/Screenshot%202025-06-09%20at%2012.46.36.png)