import { useState } from 'react'
import './App.css'
import './App.js'

function App() {
  const [] = useState(0)

  return (
    <>
      <title>Task Manager</title>
      <link rel="stylesheet" href="App.css" />
      <link rel="icon" type="image/x-icon" href="Icons/logo1.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* The Header of the website*/}
      <div className="header" id="myHeader">
        {/* Left section with the menu button of the header*/}
        <div className="left-section">
          <button id="menu-button" className="menu-button" onClick={() => openNav()}>
            <img src="Icons/menu-burger.png" className="menu" />
          </button>
        </div>
        {/* Middle section with the search bar, search button and filter of the header*/}
        <div className="mid-section">
          <input
            id="search-bar"
            type="text"
            className="search-bar"
            placeholder="Search"
          />
          <button id="filter-button" className="filter-button">
            <img src="Icons/filter-icon.png" className="filter" />
          </button>
          <button id="view-type-button" className="view-type-button">
            <img src="Icons/tile.png" className="notifications" />
          </button>
        </div>
        {/* Right section with the view type button of the header*/}
        <div className="right-section">
          <button className="sign-in-button" id="signInButton">
            <img src="Icons/user.png" className="user-icon" />
            Sign In
          </button>
          <button className="settings-button">
            <img src="Icons/settings-icon.png" className="settings-icon" />
          </button>
        </div>
      </div>
      {/* Task creation */}
      <div className="tasks">
        <div>
          <button className="newtask" id="myBtn">
            <img src="Icons/add-icon.png" className="add-icon" />
            New Task
          </button>
          <div id="task-list" />
        </div>
        <hr />
      </div>
      {/* Website information section on the homepage */}
      <div className="website-info">
        <h2>Organize your work!</h2>
        <img src="Icons/Logo1.png" className="page-logo" alt="Tasks Image" />
        <p>Instantly create and manage your tasks.</p>
      </div>
      {/* The new task modal */}
      <div className="modal" id="myModal" style={{ display: "none" }}>
        {/* Modal content */}
        <div className="modal-content" id="new-task-modal-content">
          Create a Task
          <span className="close">
            <img src="Icons/cross.png" className="close-task-module" />
          </span>
          <input type="text" className="task-name" placeholder="Task Name" />
          <input type="date" className="task-due-date" />
          Due Date
          <br />
          <select className="task-priority">
            <option value="" disabled="" selected="">
              Set the Priority
            </option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <br />
          <select className="category">
            <option value="" disabled="" selected="">
              Select a category
            </option>
            <option value="Work">Work</option>
            <option value="House work">House Work</option>
            <option value="School work">School Work</option>
            <option value="Shopping">Shopping</option>
            <option value="Hobbies">Hobbies</option>
            <option value="Other">Other</option>
            {/*<option value=""></option>*/}
          </select>
          <br />
          <select className="status">
            <option value="" disabled="" selected="">
              Status
            </option>
            <option value="Open">Open</option>
            <option value="In progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <br />
          <textarea
            maxLength={300}
            className="description"
            placeholder="Description...(Max 300)"
            defaultValue={""}
          />
          <br />
          <input type="submit" className="submit-button" defaultValue="Submit" />
          <br />
        </div>
      </div>
      {/* The Filter Modal */}
      <div className="filter-modal" id="filterModal" style={{ display: "none" }}>
        {/* Filter Modal content */}
        <div className="filter-modal-content" id="filter-modal-content">
          <span className="filter-close" id="close-filter">
            <img src="Icons/cross.png" className="close" />
          </span>
          <h3>Priority and Status</h3>
          <br />
          <form>
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="High"
              />{" "}
              High Priority
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Medium"
              />{" "}
              Medium Priority
            </label>
            <br />
            <label>
              <input type="checkbox" className="filter-option" defaultValue="Low" />{" "}
              Low Priority
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Open"
              />{" "}
              Open Status
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="In progress"
              />{" "}
              In Progress Status
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Done"
              />{" "}
              Done Status
            </label>
            <br />
            <h3>Sort by date and priority</h3>
            <br />
            <select className="asc-desc-select" id="sort-select">
              <option value="" disabled="" selected="">
                Sort By
              </option>
              <option value="none">Unselected</option>
              <option value="due-date-asc">Due Date (Ascending)</option>
              <option value="due-date-desc">Due Date (Descending)</option>
              <option value="priority-asc">Priority (Ascending)</option>
              <option value="priority-desc">Priority (Descending)</option>
            </select>
            <h3>Category</h3>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Work"
              />{" "}
              Work
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="House work"
              />{" "}
              House Work
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="School work"
              />{" "}
              School Work
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Shopping"
              />{" "}
              Shopping
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Hobbies"
              />{" "}
              Hobbies
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                className="filter-option"
                defaultValue="Other"
              />
              Other
            </label>
            <br />
            {/*<label><input type="checkbox" class="filter-option" value="other"></label>*/}
            <br />
          </form>{" "}
          <button id="apply-filters-button" className="apply-filters-button">
            Apply
          </button>
        </div>
      </div>
      {/* Settings Modal */}
      <div
        className="settings-modal modal"
        id="settingsModal"
        style={{ display: "none" }}
      >
        <div className="settings-modal-content" id="settings-modal-content">
          <span className="close-settings">
            <img src="Icons/cross.png" className="close" />
          </span>
          <h3>Settings</h3>
          {/* Dark Mode Toggle */}
          <div className="setting-item">
            <label htmlFor="darkModeToggle">Light Mode:</label>
            <label className="switch">
              <input type="checkbox" id="darkModeToggle" />
              <span className="slider round" />
            </label>
          </div>
          {/* Border Color Picker */}
          <div className="setting-item">
            <label htmlFor="borderColorPicker">Border Color:</label>
            <input type="color" id="borderColorPicker" defaultValue="#a6ddef" />
          </div>
        </div>
      </div>
      <div className="acc-modal" id="accModal" style={{ display: "none" }}>
        <div className="acc-modal-content" id="accModalContent">
          <span className="close-acc-modal" id="closeAccModal">
            <img src="Icons/cross.png" className="close" />
          </span>
          <h3 style={{ margin: "10px 0px" }}>Username:</h3>
          <label>
            <input
              type="text"
              className="username"
              placeholder="Enter Username"
              maxLength={12}
            />
          </label>
          <h3 style={{ margin: "10px 0px" }}>Password:</h3>
          <label>
            <input
              type="password"
              className="password"
              placeholder="Enter Password"
            />
          </label>
          <button className="cancel" id="cancel">
            Cancel
          </button>
          <button className="sign-in" id="signIn">
            Sign In
          </button>
        </div>
      </div>
      {/* Sidebar containing information, and analytics */}
      <div className="sidebar" id="mySidebar">
        {/* sidebar content */}
        <a href="javascript:void(0)" className="closebtn" onClick={() => closeNav()}>
          <button className="close-button">
            <img src="Icons/cross.png" className="close" />
          </button>
        </a>
        <a href="analytics.html" className="not-x">
          <img src="Icons/chart-histogram.png" className="chart" />
          See Analytics
        </a>
        <hr />
        <a href="information-help.html" className="not-x">
          <img src="Icons/info.png" className="info" />
          Information/Help
        </a>
        <hr />
        <a href="User-manual.html" className="not-x">
          <img src="Icons/manual.png" className="manual" />
          User manual
        </a>
        <hr />
      </div>
      {/**/}
    </>
  )
}

export default App
