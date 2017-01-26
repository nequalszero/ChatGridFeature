import React from 'react';
import ReactDOM from 'react-dom';

const questionBase = () => ({ text: "" });
const formBase = () => ({title: "", questions: [questionBase()]});
const defaultQuestions = [
	{	title: "Questions About Life",
  	questions: [{text: "Why is the sky blue?"},
    						{text: "Why is the president orange?"}]
  },
  {	title: "Coding Survey",
  	questions: [{text: "Would you rather code in Fortran or Ook?"},
    						{text: "Do you think Chuck Norris solve Towers of Hanoi in 1 move?"}] }
];

const NewQuestion = (props) => {
	return(
  	<div className="new-input-container">
    	<h4 className="new-question-title">Question:</h4>
      <input className="text-input"
      			 onChange={props.updateText(props.idx)}
      			 value={props.question.text}>
      </input>
    </div>
  );
};

const FormItem = (props) => {
	return(
  	<div className="form-index-item">
    	<p>{`${props.idx + 1}.) ${props.formItem.title}`}</p>
      <button className="view-form-button">
      	View/Edit
      </button>
    </div>
  );
};

const QuestionForm = (props) => {
  return (
    <div className="question-form-container">
      <div className="question-form-container-content">
        <div className="new-input-container">
          <h3 className="new-form-title">Title: </h3>
          <input className="text-input"
                 onChange={props.onTitleChange}
                 value={props.titleValue}/>
        </div>
        {props.questions.map((el, idx) => (
          <NewQuestion question={el}
                       idx={idx}
                       updateText={() => props.updateQuestionText(idx)}
                       key={idx}/>
        ))}
      </div>
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
      questions: defaultQuestions
    };

    this.openQuestion = this.openQuestion.bind(this);
    this.closeQuestion = this.closeQuestion.bind(this);
   	this.newQuestionForm = this.newQuestionForm.bind(this);
    this.updateQuestionText = this.updateQuestionText.bind(this);
    this.updateNewFormTitle = this.updateNewFormTitle.bind(this);
    this.addNewQuestion = this.addNewQuestion.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.displayForms = this.displayForms.bind(this);
    this.viewEditForm = this.viewEditForm.bind(this);
    this.editViewDisplay = this.editViewDisplay.bind(this);
  }

  openQuestion() {
  	this.setState({addNew: true});
  }

  closeQuestion() {
    console.log("inside closeQuestion");
  	this.setState({addNew: false});
  }

  clearForm() {
  	this.setState({newForm: formBase()});
  }

  submitForm() {
    let questions = this.state.questions;
    questions.push(this.state.newForm);
    this.setState({
    	questions: questions,
      newForm: formBase(),
      addNew: false
    });
  }

  updateQuestionText(idx) {
  	return (e) => {
      let newForm = this.state.newForm;
      let questions = newForm.questions;
      let question = questions[idx];
      question.text = e.target.value;
      this.setState({
        newForm: newForm
      });
    };
  }

  updateNewFormTitle(e) {
  	let newForm = this.state.newForm;
   	newForm.title = e.target.value;
    this.setState({newForm: newForm});
  }

  addNewQuestion() {
  	let newForm = this.state.newForm;
    newForm.questions.push(questionBase());
    this.setState({newForm: newForm});
  }

  viewEditForm(idx) {
  	this.setState({
    	editViewEnabled: true,
      editViewItem: Object.assign({}, this.state.questions[idx]),
 			editViewIndex: idx
    });
  }

  editViewDisplay() {
  	return (
    	<div className="edit-view-container">

      </div>
    );
  }

  questionFormNavbar(type="new") {
  	if (type === "new") {
    	return (
        <div className="question-form-navbar">
          <button onClick={this.addNewQuestion}>
            Add Another Question
            </button>
          <button onClick={this.submitForm}>
            Submit Form
          </button>
          <button onClick={this.clearForm}>
            Clear Form
          </button>
          <button onClick={this.closeQuestion}>
            Close
          </button>
        </div>
      );
    } else if (type === "edit") {
    	return (
        <div className="question-form-navbar">
          <button onClick={this.addNewQuestion}>
            Add Another Question
            </button>
          <button onClick={this.updateForm}>
            Save Changes
          </button>
          <button onClick={this.clearForm}>
            Clear Form
          </button>
          <button onClick={this.closeQuestion}>
            Close
          </button>
        </div>
      );
    } else {
    	console.log("Exception in questionFormNavbar, type was: ", type);
    }
  }

  newQuestionForm() {
  	console.log(this.state);
    if (this.state.addNew || this.state.editViewEnabled) {
      // let that = this;
      let titleValue, questions, status;
      let onTitleChange, updateQuestionText, navbar;

      if (this.state.addNew && this.state.editViewEnabled) {
        throw "Error in newQuestionForm: both addNew and editViewEnabled are true";
      }
      else if (this.state.addNew) {
        status = "new";
        titleValue = this.state.newForm.title;
        questions = this.state.newForm.questions;
        onTitleChange = this.updateNewFormTitle;
        updateQuestionText = this.updateQuestionText;
        navbar = this.questionFormNavbar(status);
      } else if (this.state.editViewEnabled) {
        status = "edit";
      }

    	return <QuestionForm status={status}
                           titleValue={titleValue}
                           questions={questions}
                           onTitleChange={onTitleChange}
                           updateQuestionText={updateQuestionText}
                           navbar={navbar} />;
    }
  }

  displayForms() {
  	return (
    	<div className="form-index-container">
        {this.state.questions.map((el, idx) => (
          <FormItem formItem={el}
          					idx={idx}
                    viewEditForm={this.viewEditForm}
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
        {this.newQuestionForm()}
        {this.editViewDisplay()}
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
