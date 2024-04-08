import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
function App() {
  const [todos, setTodos] = useState([]);


  // Import tasks from local storage
  // const loadTodos = () => {
  //   const savedTodos = localStorage.getItem('todos');
  //   if (savedTodos) {
  //     return JSON.parse(savedTodos);
  //   }
    // Example tasks if the local storage is empty
  //   return [
  //        {
  //     content: 'Example task 1',
  //     isCompleted: false,
  //   },
  //   {
  //     content: 'Example task 2',
  //     isCompleted: false,
  //   },
  //   {
  //     content: 'Done Example task',
  //     isCompleted: true,
  //   }
 
  //   ];
  // }

  // useEffect(() => {
  //   localStorage.setItem('todos', JSON.stringify(todos));
  // }, [todos]);
  // const [todos, setTodos] = useState(loadTodos());


  // Fetch to-dos from the server
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('/api/todos');
        setTodos(response.data); // Returning array of to-dos from back-end
      } catch (err) {
        console.error('Failed to fetch todos:', err)
      }
    };
    
    fetchTodos();
  }, []);
  
  // Automatically add an empty todo at the start of the list if all tasks are completed or the list is cleared
  useEffect(() => {
    if (todos.every(todo => todo.isCompleted) || todos.length === 0) {
      setTodos([
        {
          content: '',
          isCompleted: false,
        },
     ...todos,
      ]);
    }
  })

  function handleKeyDown(e, i) {
    const currentTodo = todos[i]

    // Check for "Enter but not "Shift + Enter"
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Distinguish between new and exiting to-dos
      if (currentTodo && currentTodo.isNew) {
        saveNewTodoAtIndex(currentTodo, i);
      } else {
        // Insert a new, empty to-do at the next index. isNew to indicate unsaved to-dos        
        const newTodos = [...todos];
        newTodos.splice(i + 1, 0, { content: '', isCompleted: false, isNew: true}); 
        setTodos(newTodos);
      }      
    }

    if (e.key === 'Backspace' && todos[i].content === '') {
      e.preventDefault();
      return removeTodoAtIndex(i);
    }

    // Navigate up the list
    if (e.key === 'ArrowUp') {
      if (i === 0) return;
      document.forms[0].elements[i - 1].focus();
    }

    // Navigate down the list
    if (e.key === 'ArrowDown') {
      if (i === todos.length - 1) return;
      document.forms[0].elements[i + 1].focus();
    }

    // If ctrl+enter is pressed toggle the todo as completed/incomplete
    if (e.key === 'Enter' && e.ctrlKey) {
      toggleTodoCompleteAtIndex(i);
      // set focus to same index that it when completing/incompleting the task
      setTimeout(() => {
        document.forms[0].elements[i].focus();
      }, 0);      
    }
  }

  function handleBlur(e, todo, index) {
    const content = e.target.value.trim();

    // Update existing to-do
    if (todo.id && content !== todo.content) {
      // Todo has an ID and content has changed so update it
      axios.put(`/api/todos/${todo.id}`, {...todo, content: updatedContent })
      .then(response => {
        // Update the local state with the updated to-do from the server
        const updatedTodos = [...todos];
        updatedTodos[index] = response.data;
        setTodos(updatedTodos);
        })
        .catch(err => console.error("Failed to update todo:", err));
      // Add New Todo
      } else if (!todo.id && content) {
      // If a new to-do and content is empty
        axios.post('/api/todos', { content})
          .then(response => {
            // Replace the placeholder to-do with the to-do from the server
            const updatedTodos = [...todos];
            updatedTodos[index] = response.data;
            setTodos(updatedTodos);
          })
          .catch(err => console.error("Failed to create todo:", err));
      } 
      // Empty New Todo
      else if (!todo.id && !content) {
        // If the to-do is empty, remove this placeholder todo
        const updatedTodos = [...todos].filter((_, i) => i !== index);
        setTodos(updatedTodos);
      }
    }
  
  function saveNewTodoAtIndex(todo, index) {
    if (todo.content.trim()) {
      axios.post('/api/todos', { content: todo.content })
        .then(response => {
          const newTodos = [...todos];
          newTodos[index] = response.data;
          setTodos(newTodos);
        })
        .catch(err => console.error("Failed to create todo:", err));
    } else {
      // Remove placeholder if no content was entered
      removeTodoAtIndex(index)
    }
  }

  function createTodoAtIndex(e, i) {
    if (e.key === 'Enter') {
      const newTodoContent = e.target.value;
      // Prevent adding empty todos
      if (!newTodoContent.trim()) return; 
    }
  }

  function updateTodoAtIndex(e, i) {
    const newTodos = [...todos];
    newTodos[i].content = e.target.value;
    setTodos(newTodos);
  }

  function removeTodoAtIndex(i) {
    const todo = todos[i]
    
    if (todo.id) {
      axios.delete(`/api/todos/${todo.id}`)
        .then(() => {
          // After succesfful deletion update local state
          const updatedTodos = todos.filter((_, index) => index !== i)
          setTodos(updatedTodos);
        })
        .catch(err => console.error("Failed to delete todo:", err));
    } else {
      //  If it's a new, unsaved to-do, remove it from local state, no need for backend interaction
      const updatedTodos = todos.filter((_, index) => index !== i)
      setTodos(updatedTodos);
    }
  }

  function toggleTodoCompleteAtIndex(index) {
    const temporaryTodos = [...todos];
    // Toggle the isCompleted property
    temporaryTodos[index].isCompleted = !temporaryTodos[index].isCompleted;

    // If the todo is now completed, move it to the end of the list
    if (temporaryTodos[index].isCompleted) {
      const completedTodo = temporaryTodos.splice(index, 1)[0];
      temporaryTodos.push(completedTodo);
    }
    setTodos(temporaryTodos);
  }

  // Star at index + move the starred to index[0]
  function toggleStarAtIndex(index) {
    const temporaryTodos = [...todos];
    // Toggle the isCompleted property
    temporaryTodos[index].isStarred =!temporaryTodos[index].isStarred;

    // If the todo is now completed, move it to the end of the list
    if (temporaryTodos[index].isStarred) {
      const starredTodo = temporaryTodos.splice(index, 1)[0];
      temporaryTodos.unshift(starredTodo);
    }
    setTodos(temporaryTodos);
  }


  return (
    <div className="app">
      <div className="header">
        <h1>Must (To) Do Today!</h1>
      <p>Press: <strong>Enter</strong> to Add, <strong>Backspace</strong> to Remove and <strong>Arrow keys</strong> to navigate between items. <strong>Ctrl+Enter</strong> to quick complete items.</p>    
      </div>
      <form className="todo-list">
        <ul>
          {todos.map((todo, i) => (
            <div className={`todo ${todo.isCompleted && 'todo-is-completed'}`}>
              <div className={`star ${todo.isStarred ? 'starred' : ''}`} onClick={() => toggleStarAtIndex(i)}>
                  <span></span>
              </div>
              <div className={'checkbox'} onClick={() => toggleTodoCompleteAtIndex(i)}>
                {todo.isCompleted && (
                  <span>&#x2714;</span>
                )}
              </div>
              <input
                type="text"
                value={todo.content}
                onBlur={(e) => handleBlur(e, todo, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onChange={(e) => updateTodoAtIndex(e, i)}
              />
            </div>
          ))}
        </ul>
        <div className="clearDone">
          {/* Button for the completed tasks */}
          <button type="button" className='btn' 
            onClick={() => setTodos(todos.filter(todo =>!todo.isCompleted))}>Clear Completed
          </button>
        </div>
      </form>
      <div className="footer">
        <p>Created by <a href='https://arttu.info'>Arttu Heinilä</a></p>
      </div>
    </div>
  );
}

export default App;
