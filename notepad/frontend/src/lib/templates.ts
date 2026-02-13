export interface NoteTemplate {
  name: string;
  icon: string;
  title: string;
  content: string;
  tags: string[];
}

export const templates: NoteTemplate[] = [
  {
    name: "Meeting Notes",
    icon: "📋",
    title: "Meeting Notes - [Date]",
    content: `<h2>Meeting Notes</h2>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Attendees:</strong></p>
<ul>
<li>Person 1</li>
<li>Person 2</li>
</ul>
<h3>Agenda</h3>
<ol>
<li>Topic 1</li>
<li>Topic 2</li>
<li>Topic 3</li>
</ol>
<h3>Discussion Notes</h3>
<p></p>
<h3>Action Items</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Action item 1 - @person</li>
<li data-type="taskItem" data-checked="false">Action item 2 - @person</li>
</ul>
<h3>Next Steps</h3>
<p></p>`,
    tags: ["meeting"],
  },
  {
    name: "Daily Journal",
    icon: "📓",
    title: "Journal - [Date]",
    content: `<h2>Daily Journal</h2>
<h3>Gratitude</h3>
<p>Today I'm grateful for...</p>
<h3>What happened today</h3>
<p></p>
<h3>What I learned</h3>
<p></p>
<h3>Tomorrow's priorities</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Priority 1</li>
<li data-type="taskItem" data-checked="false">Priority 2</li>
<li data-type="taskItem" data-checked="false">Priority 3</li>
</ul>
<h3>Mood</h3>
<p></p>`,
    tags: ["journal"],
  },
  {
    name: "Todo List",
    icon: "✅",
    title: "Todo - [Date]",
    content: `<h2>Todo List</h2>
<h3>High Priority</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Task 1</li>
<li data-type="taskItem" data-checked="false">Task 2</li>
</ul>
<h3>Medium Priority</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Task 1</li>
<li data-type="taskItem" data-checked="false">Task 2</li>
</ul>
<h3>Low Priority</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Task 1</li>
</ul>`,
    tags: ["todo"],
  },
  {
    name: "Brainstorm",
    icon: "💡",
    title: "Brainstorm - [Topic]",
    content: `<h2>Brainstorm Session</h2>
<p><strong>Topic:</strong> [Topic]</p>
<p><strong>Goal:</strong> [What are we trying to solve?]</p>
<h3>Ideas</h3>
<ul>
<li>Idea 1</li>
<li>Idea 2</li>
<li>Idea 3</li>
</ul>
<h3>Pros & Cons</h3>
<table>
<tr><th>Idea</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Idea 1</td><td></td><td></td></tr>
<tr><td>Idea 2</td><td></td><td></td></tr>
</table>
<h3>Decision</h3>
<p></p>
<h3>Next Steps</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Step 1</li>
</ul>`,
    tags: ["brainstorm"],
  },
];
