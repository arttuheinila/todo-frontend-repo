import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';     
import Login from './components/Login'
import Register from './components/Register'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [todos, setTodos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  // Ref to store the index of a newly added todo for focusing
  const newTodoIndexRef = useRef(null);

  // Fetch to-dos from the server
  const fetchTodos = async () => {
    try {
    const { data } = await axios.get(`${API_BASE_URL}/api/todos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
    });
    setTodos(data)
  } catch (error) {
    console.log('Failed to fetch todos:', error);
  }
};
  useEffect(() => {
  if (localStorage.getItem('token')) {
    // Update login status if token is present
    setIsLoggedIn(true);
    // And get todos
    fetchTodos();
  }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true); 
    fetchTodos();
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Clear todos from state
    setTodos([])
  }

  // Axios interceptor to attach login-token to every request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        config.headers.Authorization = token ? `Bearer ${token}` : '';
        return config;
      },
      error => {
        Promise.reject(error);   
      }
    );

    // Cleanup the interceptor when it's not needed anymore
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
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
  }, [todos])


  // Add hotkey functions
  const handleKeyDown = (e, idx) => {
    // Enter saves new tasks
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      toggleTodoCompleteAtIndex(idx);
    }
    // Tab saves current and creates a new todo
    else if (e.key === 'Tab') {
      e.preventDefault();
      // Save current
      saveTodoAtIndex(idx, () => {
        // After saving, add a new todo
        addNewTodoAtIndex(idx + 1);
      });
    }
    // Backspace removes empty to-do
    else if (e.key === 'Backspace' && todos[idx].content === '' && !todos[idx].isNew) {
      e.preventDefault();
      removeTodoAtIndex(idx);
    }
    // Arrows to navigate between tasks
    else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      document.forms[0].elements[idx - 1].focus();
    }
    else if (e.key === 'ArrowDown' && idx < todos.length -1) {
      e.preventDefault();
      document.forms[0].elements[idx + 1].focus();
    }
    // Ctrl+Enter toggles the todo as completed/incomplete
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveTodoAtIndex(idx);
      showToastMessage();
    }
    // Star the todo
    else if (e.key === 's' && e.altKey) {
      e.preventDefault();
      toggleStarAtIndex(idx);
    }
  };

  function updateTodoAtIndex(e, idx) {
    const newTodos = [...todos];
    newTodos[idx] = { ...newTodos[idx], content: e.target.value };
    setTodos(newTodos);
  }

  const saveTodoAtIndex = (idx, callback) => {
    const todo = todos[idx];
    if (todo.id) {
      axios.put(`${API_BASE_URL}/api/todos/${todo.id}`, todo)
      .then(response => {
        updateLocalTodos(idx, response.data);
        // Show toast message on successful todo update
        // showToastMessage();
        // Call the callback after save, if provided
        if (callback) callback();
      }).catch(console.error);
    } else {
      axios.post(`${API_BASE_URL}/api/todos`, todo)
      .then(response => {
        updateLocalTodos(idx, response.data);
        // Show toast on successful creation
        // showToastMessage();
        // Call the callback after save, if provided
        if (callback) callback();
      }).catch(console.error);
    }
  };

  const addNewTodoAtIndex = (idx) => {
    const newTodo = { content: '', isCompleted: false, isNew: true };
    const updatedTodos = [...todos.slice(0, idx), newTodo, ...todos.slice(idx)];
    setTodos(updatedTodos);
    newTodoIndexRef.current = idx;  // Set the ref for the new todo index
  };

  useEffect(() => {
    if (newTodoIndexRef.current !== null) {
      document.forms[0].elements[newTodoIndexRef.current].focus();
      newTodoIndexRef.current = null;
    }
  }, [todos]);

  const removeTodoAtIndex = (idx) => {
    const todo = todos[idx]
    
    if (todo.id) {
      axios.delete(`${API_BASE_URL}/api/todos/${todo.id}`)
        .then(() => {
          // After successful deletion update local state
          const updatedTodos = todos.filter((_, index) => index !== idx)
          setTodos(updatedTodos);
        })
        .catch(err => console.error("Failed to delete todo:", err));
    } else {
      //  If it's a new, unsaved to-do, remove it from local state, no need for backend interaction
      const updatedTodos = todos.filter((_, index) => index !== idx)
      setTodos(updatedTodos);
    }
  }

  const toggleTodoCompleteAtIndex = (idx) => {
    const updatedTodos = todos.map((todo, index) => {
        if (index === idx) {
            // Toggle completion status and update the backend
            const newIsCompleted = !todo.is_completed;
            // Optimistically update the todo item
            const updatedTodo = {...todo, is_completed: newIsCompleted};

            // Update backend
            axios.put(`${API_BASE_URL}/api/todos/${todo.id}`, 
                { ...todo, is_completed: newIsCompleted }) 
            .then(response => {
                // Update the state with the actual data returned from the backend to ensure consistency
                const refreshedTodos = updatedTodos.map((item, refreshIdx) => {
                  if (refreshIdx === idx) {
                    // Update the specific todo item with fresh data
                      return {...item, ...response.data};  
                  }
                  return item;
              });
              setTodos(refreshedTodos);
          })
          .catch(error => {
              console.error("Failed to update todo:", error);
          });

          return updatedTodo;
      }
      return todo;
  });
  // Set the optimistically updated todos to state
  setTodos(updatedTodos);
};

    // ???***
    // If the todo is now completed, move it to the end of the list
    // if (newTodos[idx].isCompleted) {
    //   const completedTodo = newTodos.splice(index, 1)[0];
    //   newTodos.push(completedTodo);
    // }
    // setTodos(newTodos);

  const toggleStarAtIndex = (idx) => {
    const newTodos = [...todos];
    newTodos[idx].is_starred = !newTodos[idx].is_starred;
    setTodos(newTodos);
    if (newTodos[idx].id) {
      // Persist the change
        axios.put(`${API_BASE_URL}/api/todos/${newTodos[idx].id}`, {
          ...newTodos[idx],
          is_starred: newTodos[idx].is_starred
        })
        .then(response => {
          updateLocalTodos(idx, response.data);
        })
        .catch(console.error);
    }
  };

  function clearCompletedTodos() {
    console.log('Clearing completed todos');
    const completedIds = todos.filter(todo => todo.is_completed)

    // Array of promises for deleting copleted todos
    const deletePromises = completedIds.map(id =>
      axios.delete(`${API_BASE_URL}/api/todos/${id.id}`)
      .catch(err => console.error("Failed to delete todo with ID:", id, err))
  );
  // Wait for all deletions to complete
  Promise.all(deletePromises).then(() => {
    console.log('All completed todos deleted');
    // Filter out the deleted todos from the state
    const updatedTodos = todos.filter(todo => !todo.is_completed);
    setTodos(updatedTodos);
  }).catch(error => {
    console.error("Error clearing completed todos:", error);
  })
  };

  const updateLocalTodos = (idx, newTodo) => {
    const updatedTodos = todos.map((item, index) => {
      if (index === idx) {
          return { ...item, ...newTodo };
      }
      return item;
    });
    setTodos(updatedTodos);
  }
  
  // Show toast message for 3 seconds
  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <>
        <div className="header">
        <h1>Must (To) Do Today!</h1>
        <p><b>You are not Logged In</b></p>      
        <p>A Todo App (duh) that let's you add, update and remove things to do without all the unnecessary bells and whistles.</p>
        <p>If you want to test the site without registering you can go <a href="https://arttu.info/todo">here</a>. Beware that unregistered todos live only in the local browser.</p>
        </div>
          <Login onLoginSuccess={handleLoginSuccess} />
          <Register />
        </>
      ) : (
        <>
      <div className="header">
        <h1>Must (To) Do Today!</h1>
        <p>You are Logged In</p>      
        {/* logout button */}
      <button onClick={handleLogout} className='logout-btn'>Logout</button>
      <p>Press: <strong>Enter</strong> to Save, <strong>Tab</strong> to Add new, <strong>Backspace</strong> to Remove, <strong>Ctrl+Enter</strong> to Complete, <strong>Alt+s</strong> to Star, <strong>Arrow keys</strong> to Navigate.</p>
      </div>
      {showToast && <div className="toast show">Todo saved</div>}
      <form className="todo-list">
        <ul>
          {todos.map((todo, i) => (
            <div key={todo.id || `temp-${i}`} className={`todo ${todo.is_completed ? 'todo-is-completed' : ''}`}>
              <div className={`star ${todo.is_starred ? 'starred' : ''}`} onClick={() => toggleStarAtIndex(i)}>
                  <span></span>
              </div>
              <div className={`checkbox ${todo.is_completed ? 'checkbox-checked' : ''}`} onClick={() => toggleTodoCompleteAtIndex(i)}>
                {todo.is_completed && (
                    <span>&#x2714;</span>  
                )}
            </div>
              <input
                type="text"
                value={todo.content}
                // onBlur={() => saveTodoAtIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onChange={(e) => updateTodoAtIndex(e, i)}
              />
            </div>
          ))}
        </ul>
        <div className="clearDone">
          {/* Button to clear completed tasks */}
          <button type="button" className='btn' 
            onClick={clearCompletedTodos}>Clear Completed
          </button>
        </div>
      </form>
      </>
      )}
      <div className="footer">
        <p>Created by <a href='https://arttu.info'>Arttu Heinilä</a><a href='https://arttu.info/contact.html'>Contact here</a></p>
      </div>
    </div>
  );
}

export default App;