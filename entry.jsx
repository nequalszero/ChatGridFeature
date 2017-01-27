import React from 'react';
import ReactDOM from 'react-dom';

// Constants to represent which type of question form is rendered.
const newFormType = "new";
const editFormType = "edit";

// Distinguish between array and object for deep dup function
const arrayPrototype = Object.getPrototypeOf([]);
const objectPrototype = Object.getPrototypeOf({});
const stringPrototype = Object.getPrototypeOf("");
const numberPrototype = Object.getPrototypeOf(1);

// Used to deep dup an object in the absense of the Lodash library.
const deepDupObject = (object) => {
  let prototype = Object.getPrototypeOf(object);
  if (prototype === stringPrototype || prototype === numberPrototype)
    return object;

  let newObject = {};

  Object.keys(object).forEach(key => {
    let value = object[key];
    let valuePrototype = Object.getPrototypeOf(value);

    if (valuePrototype === objectPrototype) {
      newObject[key] = deepDupObject(value);
    } else if (valuePrototype === arrayPrototype) {
      newObject[key] = value.map(el => deepDupObject(el));
    } else {
      newObject[key] = value;
    }
  });

  return newObject;
};

// Models base question as an object with a text key.
const questionBase = () => ({ text: "" });

// Models base question form as an object with a title and a questions key.
const formBase = () => ({title: "", questions: [questionBase()]});

// Sample forms.
const defaultQuestions = [
	{	title: "Questions About Life",
  	questions: [
                 {text: "Why is the sky blue?"},
    						 {text: "Why is the president orange?"},
                 {text: "Why is snow white?"}
               ]
  },
  {	title: "Coding Survey",
  	questions: [
                 {text: "Would you rather code in Fortran or Ook?"},
    						 {text: "Chuck Norris can solve the Towers of Hanoi in one move. True or False?"}
               ]
  },
  {	title: "Food Survey",
  	questions: [
                 {text: "Salmon or Tuna?"},
    						 {text: "Burritos or Tacos?"},
                 {text: "Sushi or Tempura?"},
                 {text: "Curry or Tikka Masala?"}
               ]
  },
];

// Component representing a new question on the question form.
const NewQuestion = (props) => {
  const getQuestionClass = () => {
    const baseClass = "new-input-container question-item";
    return (props.idx === props.activeIdx) ? `${baseClass} active-question`
                                           : baseClass;
  };

	return(
  	<div className={getQuestionClass()}
         onClick={props.addFocus}>
    	<h4 className="new-question-label">Question {props.idx + 1}: </h4>
      <input className="text-input"
      			 onChange={props.updateText(props.idx)}
      			 value={props.question.text}>
      </input>
      <button className="delete-question-button"
              onClick={props.delete}>
        Delete
      </button>
    </div>
  );
};

// Component representing an existing question form in the main view.
const FormItem = (props) => {
	return(
  	<div className="form-index-item">
    	<p>{`${props.idx + 1}.) ${props.formItem.title}`}</p>
      <button className="view-form-button"
              onClick={() => props.viewEditForm(props.idx)}>
      	View/Edit
      </button>
      <button className="delete-form-button"
              onClick={() => props.deleteForm(props.idx)}>
      	Delete
      </button>
    </div>
  );
};

// Component representing a new or and edit/view question form.
const QuestionForm = (props) => {
  return (
    <div className="question-form-container">
      <div className="question-form-container-content">
        <div className="new-input-container">
          <h3 className="new-form-title">Title: </h3>
          <input className="text-input"
                 onChange={props.updateFormTitle(props.type)}
                 value={props.form.title}/>
        </div>
        {props.form.questions.map((el, idx) => (
          <NewQuestion question={el}
                       idx={idx}
                       updateText={() => props.updateQuestion(idx, props.type)}
                       key={idx}
                       delete={() => props.deleteQuestion(idx, props.type)}
                       addFocus={() => props.markActiveQuestion(idx)}
                       removeFocus={() => props.clearActiveQuestion(idx)}
                       activeIdx={props.activeIdx}/>
        ))}
      </div>
      {props.upDownArrows}
      {props.navbar}
    </div>
  );
};

class PageContainer extends React.Component {
	constructor() {
  	super();
    this.state = {
    	addNew: false,
      editViewEnabled: false,
      editViewIndex: null,
      editViewItem: null,
      newForm: formBase(),
      questions: defaultQuestions,
      activeIdx: null
    };

    this.openQuestion = this.openQuestion.bind(this);
    this.closeQuestion = this.closeQuestion.bind(this);
   	this.renderQuestionForm = this.renderQuestionForm.bind(this);
    this.updateQuestionText = this.updateQuestionText.bind(this);
    this.updateFormTitle = this.updateFormTitle.bind(this);
    this.addNewQuestion = this.addNewQuestion.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.displayForms = this.displayForms.bind(this);
    this.viewEditForm = this.viewEditForm.bind(this);
    this.deleteForm = this.deleteForm.bind(this);
    this.deleteQuestion = this.deleteQuestion.bind(this);
    this.markActiveQuestion = this.markActiveQuestion.bind(this);
    this.clearActiveQuestion = this.clearActiveQuestion.bind(this);
    this.upDownArrows = this.upDownArrows.bind(this);
    this.moveItemUp = this.moveItemUp.bind(this);
    this.moveItemDown = this.moveItemDown.bind(this);
    this.formIsOpen = this.formIsOpen.bind(this);
  }

  // Opens new question form and ensures no editing form is open.
  openQuestion() {
  	this.setState({
      addNew: true,
      editViewEnabled: false,
      activeIdx: null
    });
  }

  // Closes question form.
  closeQuestion() {
  	this.setState({
      addNew: false,
      editViewEnabled: false,
      activeIdx: null
    });
  }

  // Checks to make sure type is either "new" or "edit".
  checkType(type, functionName) {
    if (type !== newFormType && type !== editFormType)
      throw `Error in PageContainer#${functionName}: type received was ${type}`;
  }

  // Clears question form.
  clearForm(type) {
    this.checkType(type, 'clearForm');
    if (type === newFormType)
      this.setState({
        newForm: formBase(),
        activeIdx: null
      });
    else
      this.setState({
        editViewItem: formBase(),
        activeIdx: null
      });
  }

  // Submits new question form.
  submitForm(type) {
    this.checkType(type, 'submitForm');
    let questions = this.state.questions;
    let form;

    if (type === newFormType) {
      form = this.state.newForm;
      questions.push(form);
      this.setState({
      	questions: questions,
        newForm: formBase(),
        addNew: false,
        activeIdx: null
      });
    } else {
      form = this.state.editViewItem;
      questions[this.state.editViewIndex] = form;
      this.setState({
      	questions: questions,
        editViewEnabled: false,
        editViewItem: null,
        editViewIndex: null,
        activeIdx: null
      });
    }
  }

  // Updates text field for question.
  updateQuestionText(idx, type) {
    this.checkType(type, 'updateQuestionText');

  	return (e) => {
      let form = (type === newFormType) ? this.state.newForm
                                        : this.state.editViewItem;
      let questions = form.questions;
      let question = questions[idx];
      question.text = e.target.value;
      if (type === newFormType) this.setState({ newForm: form });
      else this.setState({ editViewItem: form });
    };
  }

  // Store selected form question's index.
  markActiveQuestion(idx) {
    this.setState({activeIdx: idx});
  }

  // Removes selected question index in a form.
  clearActiveQuestion(idx) {
    this.setState({activeIdx: null});
  }

  // Updates text field for question form title.
  updateFormTitle(type) {
    this.checkType(type, 'updateFormTitle');

    return (e) => {
      let form = (type === newFormType) ? this.state.newForm
                                        : this.state.editViewItem;
      form.title = e.target.value;
      if (type === newFormType) this.setState({newForm: form});
      else this.setState({editViewItem: form});
    };
  }

  // Adds new quesiton to a form.
  addNewQuestion(type) {
  	let form = (type === newFormType) ? this.state.newForm
                                      : this.state.editViewItem;
    form.questions.push(questionBase());
    if (type === newFormType) this.setState({newForm: form});
    else this.setState({editViewItem: form});
  }

  // Delete question from a form.
  deleteQuestion(idx, type) {
    this.checkType(type, 'deleteQuestion');
    let form = (type === newFormType) ? this.state.newForm
                                      : this.state.editViewItem;
    if (form.questions.length > 1) {
      form.questions = [
        ...form.questions.slice(0, idx),
        ...form.questions.slice(idx+1)
      ];
    } else {
      form = formBase();
    }

    if (type === newFormType) this.setState({newForm: form});
    else this.setState({editViewItem: form});
  }

  // Opens up edit/view form for existing question form.
  viewEditForm(idx) {
  	this.setState({
    	editViewEnabled: true,
      addNew: false,
      editViewItem: deepDupObject(this.state.questions[idx]),
 			editViewIndex: idx,
      activeIdx: null
    });
  }

  // Delete a form.
  deleteForm(idx) {
    let questions = [
      ...this.state.questions.slice(0, idx),
      ...this.state.questions.slice(idx+1)
    ];
    this.setState({questions: questions});
  }

  // Checks whether a form is currently open.
  formIsOpen() {
    if (this.state.addNew || this.state.editViewEnabled) return true;
    return false;
  }

  // Moves a question further down in the list.
  moveItemDown(idx) {
    if (this.state.activeIdx !== null && this.formIsOpen()) {
      let form = this.state.addNew ? this.state.newForm
                                   : this.state.editViewItem;
      if (idx < form.questions.length - 1) {

        form.questions = [
          ...form.questions.slice(0, idx),
          form.questions[idx+1],
          form.questions[idx],
          ...form.questions.slice(idx+2)
        ];

        if (this.state.addNew) {
          this.setState({
            activeIdx: this.state.activeIdx + 1,
            newForm: form
          });
        } else {
          this.setState({
            activeIdx: this.state.activeIdx + 1,
            editViewItem: form
          });
        }
      }
    }
  }

  // Moves a question up in the form.
  moveItemUp(idx) {
    if (this.state.activeIdx !== null && this.formIsOpen()) {

      let form = this.state.addNew ? this.state.newForm
                                   : this.state.editViewItem;
      if (idx > 0) {
        form.questions = [
          ...form.questions.slice(0, idx-1),
          form.questions[idx],
          form.questions[idx-1],
          ...form.questions.slice(idx+1)
        ];

        if (this.state.addNew) {
          this.setState({
            activeIdx: this.state.activeIdx - 1,
            newForm: form
          });
        } else {
          this.setState({
            activeIdx: this.state.activeIdx - 1,
            editViewItem: form
          });
        }
      }
    }
  }

  // Renders button components for rearranging order of items.
  upDownArrows() {
    return (
      <div className="up-down-container">
        <button className="down-arrow"
                onClick={() => this.moveItemDown(this.state.activeIdx)}>
          DOWN
        </button>
        <button className="up-arrow"
                onClick={() => this.moveItemUp(this.state.activeIdx)}>
          UP
        </button>
      </div>
    );
  }

  // Component representing buttons at the button of the questions form
  renderQuestionFormNavbar(type=newFormType) {
  	if (type === newFormType || type === editFormType) {
    	return (
        <div className="question-form-navbar">
          <button onClick={() => this.addNewQuestion(type)}>
            Add Another Question
            </button>
          <button onClick={() => this.submitForm(type)}>
            {type === newFormType ? 'Submit Form' : 'Update Form'}
          </button>
          <button onClick={() => this.clearForm(type)}>
            Clear Form
          </button>
          <button onClick={this.closeQuestion}>
            Close
          </button>
        </div>
      );
    } else {
    	throw `Exception in renderQuestionFormNavbar, type was: ${type}`;
    }
  }

  // Renders component representing either a new or edit/view question form.
  // Takes no input and sets the type of form based on booleans in the state.
  renderQuestionForm() {
    if (this.state.addNew || this.state.editViewEnabled) {
      if (this.state.addNew && this.state.editViewEnabled) {
        throw "Error in renderQuestionForm: both addNew and editViewEnabled are true";
      }

      let type = this.state.addNew ? newFormType : editFormType;
      let form = (type === newFormType) ? this.state.newForm
                                        : this.state.editViewItem;

    	return <QuestionForm type={type}
                           form={form}
                           updateFormTitle={this.updateFormTitle}
                           updateQuestion={this.updateQuestionText}
                           navbar={this.renderQuestionFormNavbar(type)}
                           upDownArrows={this.upDownArrows()}
                           deleteQuestion={this.deleteQuestion}
                           markActiveQuestion={this.markActiveQuestion}
                           clearActiveQuestion={this.clearActiveQuestion}
                           activeIdx={this.state.activeIdx}/>;
    }
  }

  // Renders a list of existing questionares.
  displayForms() {
  	return (
    	<div className="form-index-container">
        {this.state.questions.map((el, idx) => (
          <FormItem formItem={el}
          					idx={idx}
                    viewEditForm={this.viewEditForm}
                    deleteForm={this.deleteForm}
                    key={idx}/>
        ))}
      </div>
    );
  }

  render() {
    return(
    	<div className="page-container">
      	<div className="questions-container">
    			<h2 className="questions-container-title">My Forms</h2>
          {this.displayForms()}
    		</div>
        <button className="add-question"
        				onClick={this.openQuestion}>
        	New Question Form
        </button>
        {this.renderQuestionForm()}
      </div>
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <PageContainer />,
    document.getElementById('container')
  );
});
