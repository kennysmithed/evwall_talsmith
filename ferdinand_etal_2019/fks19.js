/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*
The experiment features two main trial types - observation (training) and production (test)
Observation: see object for 1 second, then object plus label for 2 seconds
Production: object plus two labels, select label. NB for simplicity I deleted the 3rd part of this 
where the participant confirms their label choice to center cursor.
*/


/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

/*
make_observation_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a label to pair
it with.

I am using the image-button-response trial type, even though the participant doesn't
provide a response at all, just because it was the easiest way to make the layout
look similar to the production trial type.

Each observation trial consists of two trials: the initial presentation of the
object (for 1000ms) and then the object plus label (in the prompt) for 2000ms. The
initial 1000ms presentation contains some dummy text as the prompt - '&nbsp;' is
a special html space character.

In the 2000ms part of the trial I add a property to the trial's data, noting that
this trial is part of the observation block of the experiment - this will come in
handy later, and will allow us to strip out the important bit of the observation
trials from all the other clutter that jspsych saves as data.
*/

function make_observation_trial(object,label) {
  var object_filename = 'images/' + object + '.jpg' //build file name for the object
  trial = {type:'image-button-response',
           stimulus:object_filename,
           choices:[],
           timeline:[{prompt:'&nbsp;', //dummy text
                      trial_duration:1000},
                     {prompt:label,
                       trial_duration:2000,
                       post_trial_gap:250
                      }]}
  return trial
}

/*
Now we can use this function to make some observation trials - object4 paired with
two non-word labels, buv and cal.
*/
var observation_trial_obj2_label1 = make_observation_trial('object2','lem')
var observation_trial_obj2_label2 = make_observation_trial('object2','vit')
var observation_trial_obj4_label1 = make_observation_trial('object4','mig')
var observation_trial_obj4_label2 = make_observation_trial('object4','dap')

/*
We are going to need several of these trials in training - we can do this using
the built-in function that jspsych provides for repeating trials, jsPsych.randomization.repeat.
I will have 3 occurences of buv and 2 of cal.
*/
var observation_trial_obj2_label1_repeated = jsPsych.randomization.repeat([observation_trial_obj2_label1], 3)
var observation_trial_obj2_label2_repeated = jsPsych.randomization.repeat([observation_trial_obj2_label2], 1)
var observation_trial_obj4_label1_repeated = jsPsych.randomization.repeat([observation_trial_obj4_label1], 2)
var observation_trial_obj4_label2_repeated = jsPsych.randomization.repeat([observation_trial_obj4_label2], 2)


/*
We then need to stick these together into a flat trial list (using concat) and then
shuffling them so that the order of the different labelings is randomised.
*/
var observation_trials_unshuffled = [].concat(observation_trial_obj2_label1_repeated,observation_trial_obj2_label2_repeated,
                                              observation_trial_obj4_label1_repeated,observation_trial_obj4_label2_repeated)
var observation_trials = jsPsych.randomization.shuffle(observation_trials_unshuffled)


/******************************************************************************/
/*** Production trials ************************************************/
/******************************************************************************/

/*
make_production_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a list of labels
the participant must select among when labelling the object, which will appear as
clickable buttons.

Each production trial consists of three sub-trials: the initial presentation of the
object (for 1000ms), then the object plus label choices presented as buttons, then
a third trial where the participant clicks again on the label they selected on the
second trial, to centre their mouse (i.e to prevent rapid clicking through on the
left or right button.

The first subtrial (just show the object) is in principle quite simple, but in order
to make the trials flow smoothly into one another visually (i.e. avoid the object
jumping about on the screen when the buttons appear on subtrial 2) we have to include
a button array consisting of invisible, unclickable buttons. This is achieved
using the button_html propery of the image-button-response plugin (which allows us
to specify that the buttons are hidden rather than visible) *and* response_ends_trial:false,
which means that if the participant clicks on the invisible buttons nothing happens.

The second subtrial is the most important part, where we present the two label choices
and have the participant click. We want the labels to appear in a random order on
each trial (e.g. so the same label isn't always on the left). I do this by using
the on_start property pf the trial: when the trial starts, but before anything is shown
to the participant, the labels are shuffled randomly. We also store that shuffling in
the trial's data parameter, creating a new data field called label_choices. We also
lable this trial data as being from the production block, which will be handy later.

The participant will then be shown the labels as clickable buttons with the randomised
order. When the trial ends (i.e. on_finish) we use the button_pressed property
returned by the trial to figure out which label the participant selected, and
record that in the trial data under label_selected.

*/

function make_production_trial(object,label_choices) {
  var object_filename = 'images/' + object + '.jpg'
  var trial = {type:'image-button-response',
                         stimulus:object_filename,
                         timeline: [//subtrial 2: show the two labelled buttons and have the participant select
                                    {choices: [],
                                      prompt:'&nbsp;', //dummy text
                                      //at the start of the trial, randomise the left-right order of the labels
                                      //and note that randomisation in data
                                      on_start: function(trial) {
                                        var shuffled_label_choices = jsPsych.randomization.shuffle(label_choices)
                                        trial.choices = shuffled_label_choices
                                        trial.data = {label_choices:shuffled_label_choices}
                                    },

                                     //at the end, use data.button_pressed to figure out
                                     //which label they selected, and add that to data
                                     on_finish: function(data) {
                                        var button_number = data.response
                                        var label_pressed = data.label_choices[button_number]
                                        data.label_selected = label_pressed}
                                      },
                                      //confirm
                                      {choices:[],
                                        prompt:'&nbsp;', //dummy text
                                        on_start:function(trial) {
                                          //get the last trial response (the data generated by the button-click)
                                          var last_trial_data = jsPsych.data.get().last(1).values()[0]
                                          //look up the label_selected on that last trial
                                          var last_trial_label = last_trial_data.label_selected
                                          trial.choices=[last_trial_label] //this is your only choice
                                        }},
                                      //substrial 3 - show it
                                      {trial_duration:2000,
                                        choices:label_choices, //these buttons are invisible and unclickable!
                                        button_html:'<button style="visibility: hidden;" class="jspsych-btn">%choice%</button>',
                                        post_trial_gap:250,
                                        on_start:function(trial) {
                                          //get the last trial response (the data generated by the button-click)
                                          var last_trial_data = jsPsych.data.get().last(2).values()[0]
                                          //look up the label_selected on that last trial
                                          var last_trial_label = last_trial_data.label_selected
                                          trial.prompt=last_trial_label //this is your only choice
                                        }}
                                    ]}
  return trial

}

/*
Use the same procedure as for observation trials to generate repeated production trials -
I am having 5 here, just testing the participant on object4 and forcing them to choose
between the two labels they saw it with in training, buv and cal.
*/
var production_trial_obj2 = make_production_trial('object2',['lem','vit'])
var production_trials_obj2_repeated = jsPsych.randomization.repeat([production_trial_obj2], 1)
var production_trial_obj4 = make_production_trial('object4',['mig','dap'])
var production_trials_obj4_repeated = jsPsych.randomization.repeat([production_trial_obj4], 1)

var production_trials_unshuffled = [].concat(production_trials_obj2_repeated,production_trials_obj4_repeated)
var production_trials = jsPsych.randomization.shuffle(production_trials_unshuffled)


/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
As usual, your experiment will need some instruction screens.
*/

var consent_screen = {
  type: 'html-button-response',
  stimulus: "<h3>Welcome to the experiment</h3> \
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant \
  what they will be doing, how their data will be used, and how they will be \
  remunerated.</p> \
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed \
  as part of the ethical review process.</p>",
  choices: ['Yes, I consent to participate'],
}

var instruction_screen_observation = {
  type: 'html-button-response',
  stimulus: "<h3>Observation Instructions</h3>\
  <p style='text-align:left'>Instructions for the observation stage. Each stage will start with instructions\
  explaining to participants what they are doing. This is a placeholder for that information.</p>",
  choices: ['Continue']
}

var instruction_screen_production = {
  type: 'html-button-response',
  stimulus: "<h3>Production Instructions</h3>\
  <p style='text-align:left'>Instructions for the production phase. Each stage will start with instructions\
  explaining to participants what they are doing. This is a placeholder for that information.</p>",
  choices: ['Continue']
}

var final_screen = {
  type: 'html-button-response',
  stimulus: "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion \
  code so the participant can claim their payment. This is a placeholder for that information.</p>",
  choices: ['Finish']}

/******************************************************************************/
/*** Demographics *******************************************************/
/******************************************************************************/


var demographics_questionnaire = {
  type: 'survey-html-form',
  preamble: "<h3>Post-experiment questionnaire</h3>\
              <p style='text-align:left'> We would like to collecting some basic \
              information about you, and also give you a chance to tell us what you \
              thought of the experiment and how you approached it!",
  html:"<p style='text-align:left'>Are you a native speaker of English?<br>  \
        <input type='radio' name='english' value='yes'>yes<br>\
        <input type='radio' name='english' value='no'>no<br></p> \
        <p style='text-align:left'>How old are you (in years)? <br> \
        <input name='age' type='number'></p> \
        <p style='text-align:left'>Any other comments on the experiment?<br> \
        <textarea name='comments' rows='10' cols='100'></textarea></p>"}
              
/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

var preload = {
  type: 'preload',
  auto_preload: true 
}

/*
I am using concat here to make sure the timeline is a flat list - just doing
timeline=[consent_screen,instruction_screen_observation,observation_trials,...]
would produce something with a nested structure (observation_trials is itself a
list) that jspsych can't handle.
*/
var full_timeline = [].concat(consent_screen,
                              preload,
                              instruction_screen_observation,
                              observation_trials,
                              instruction_screen_production,
                              production_trials,
                              demographics_questionnaire,
                              final_screen)


/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

/*
As usual, we will dump all the trials on-screen at the end so you can see what's
going on.

But we will also use some jspsych built-in functions to strip out the interesting
trials (ones we marked up as block: 'observation' or block:'production') and then
use the saveData function to save that data to the server_data folder on the
jspsychlearning server. In this case we will save it to a file called "wordlearning_data.csv".
*/
jsPsych.init({
    timeline: full_timeline,
});


