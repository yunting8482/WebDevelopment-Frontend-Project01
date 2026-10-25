const taskForm = document.getElementById("task-form");
const taskInput=document.getElementById("task-input");
const taskList=document.getElementById("task-list");
const taskCount=document.getElementById("task-count");
const filterButtons=document.querySelectorAll(".filter-btn");

const STORAGE_KEY="myTasks";

//Load saved tasks from local storage
function loadTasks() {
    try {
        const savedTasks= localStorage.getItem(STORAGE_KEY);
        
        if(!savedTasks) {
            return [];
        }

        const parsedTasks= JSON.parse(savedTasks);
        return Array.isArray(parsedTasks) ? parsedTasks : [];

    }catch (error) {
        console.error("Could not load tasks:",error);
        return [];
    }
}

let tasks = loadTasks();
let currentFilter = "all";

//save tasks to local storage

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks));
    }catch (error) {
        console.error("Could not save tasks:",error);
        alert("Unable to save tasks in this brower.");
    }
    
}

//Display tasks on the page
function renderTasks() {
    taskList.replaceChildren();

    //Filter tasks according to the selected tab
    let filteredTasks = tasks.filter(task =>{
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    //Show an empty message if there are no matching tasks
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className="empty-message";

        if (currentFilter === "active") {
            emptyMessage.textContent= " No imcompleted tasks !";
        }else if (currentFilter === "completed") {
            emptyMessage.textContent="No completed tasks yet.";
        }else {
            emptyMessage.textContent=
            "No tasks yet.Add your first task!";
        }
        taskList.appendChild(emptyMessage);
    }

    //Create each task element
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        //Checkbox
        const checkbox = document.createElement("input");
        checkbox.type="checkbox";
        checkbox.className="task=checkbox";
        checkbox.checked=task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );
        checkbox.addEventListener("change",() =>{
            toggleTask(task.id);
        });

        //Task text
        const span=document.createElement("span");
        span.className="task-text";
        span.textContent=task.text;

        //Delete button

        const deleteButton=document.createElement("button");
        deleteButton.type="button";
        deleteButton.className="delete-btn";
        deleteButton.textContent="🗑";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.text}`
        );
        deleteButton.addEventListener("click",() =>{
            deleteTask(task.id);
        });

        li.append(checkbox,span,deleteButton);
        taskList.appendChild(li);

    });

    //Count only incomplete tasks

    const remainingTasks=tasks.filter(
        task=> !task.completed
    ).length;

    taskCount.textContent=
    `${remainingTasks} task${remainingTasks !== 1 ? "s" : ""} left`;
}

//Add a new task
taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = taskInput.value.trim();

    //No empty task
    if (text === "") {
        return;
    }

    const newTask = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);

    saveTasks();

    //Show the new task even if another filter was selected
    currentFilter = "all";
    updateActiveFilter();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
});

//Toggle task completion
function toggleTask(id){
    tasks=tasks.map(task =>{
        if (task.id === id) {
            return {
                ...task,
                completed:!task.completed
            };
        }

        return task;
    });
    saveTasks();
    renderTasks();
}

//Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !==id);

    saveTasks();
    renderTasks();
}

//Switch between All,incomplete and Completed
filterButtons.forEach(button =>{
    button.addEventListener("click", () =>{
        currentFilter=button.dataset.filter;

        updateActiveFilter();
        renderTasks();
    });
});

//Highlight the currently selected filter
function updateActiveFilter(){
    filterButtons.forEach(button =>{
        const isActive =
        button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed",isActive);
    });
}

//Display saved tasks when the page opens
updateActiveFilter();
renderTasks();