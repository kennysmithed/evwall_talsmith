/******************************************************************************/
/*** Random assignment to condition *******************************************/
/******************************************************************************/

var conditions = ["harmony","disharmony"]
var assigned_condition = jsPsych.randomization.sampleWithoutReplacement(conditions,1)[0]
console.log(assigned_condition)

var training_trials
if (assigned_condition=="harmony") {
  training_trials=[make_training_trial("badger","dopo","dopofu","dopofi"),
                  make_training_trial("cat","geni","genibe","genibo"),
                  make_training_trial("fast","fast","blue","slow")]
}
else if (assigned_condition=="disharmony") {
  training_trials=[make_training_trial("badger","dopo","dopofi","dopofu"),
                  make_training_trial("cat","geni","genibo","genibe"),
                  make_training_trial("fast","fast","blue","slow")]
}

/******************************************************************************/
/*** Training trials **********************************************************/
/******************************************************************************/

function make_training_trial(image,singular_label,correct_plural_label,incorrect_plural_label) {
  var singular_image_filename = 'images/' + image + ".jpg"
  var plural_image_filename = 'images/' + image + "_2.jpg"
  var singular_label_filename = 'sounds/' + singular_label + ".wav"
  var correct_plural_filename = 'sounds/' + correct_plural_label + ".wav"
  var incorrect_plural_filename = 'sounds/' + incorrect_plural_label + ".wav"
  var option_order = jsPsych.randomization.sampleWithoutReplacement(['correct_first','correct_last'],1)[0]
  //assume correct_first, then change it if it's correct_last
  var option1_plural_filename = correct_plural_filename
  var option2_plural_filename = incorrect_plural_filename
  if (option_order=='correct_last') {
    var option1_plural_filename = incorrect_plural_filename
    var option2_plural_filename = correct_plural_filename
  }

  var singular_trial = {type:'image-button-response',
                        stimulus:singular_image_filename,
                        choices:['Click to listen']}
  var singular_trial_audio = {type:'image-button-response',
                              stimulus:singular_image_filename,
                              prompt:"<audio autoplay=true>\
                                      <source src='" + singular_label_filename + "'>\
                                      </audio>",
                              trial_duration:1000,
                              choices:['Click to listen'],//need to still show the button to stop image jumping around
                              button_html:'<button disabled class="jspsych-btn">%choice%</button>',
                              }

  var option1_trial = {type:'image-button-response',
                        stimulus:plural_image_filename,
                        choices:['Click to listen to Option 1']
                        }
  var option1_trial_audio = {type:'image-button-response',
                              stimulus:plural_image_filename,
                              prompt:"<audio autoplay=true>\
                                      <source src='"+option1_plural_filename+"'>\
                                      </audio>",
                              choices:['Click to listen to Option 1'],
                              button_html:'<button disabled class="jspsych-btn">%choice%</button>',
                              trial_duration:1000,
                              }
  
  var option2_trial = {type:'image-button-response',
                      stimulus:plural_image_filename,
                      choices:['Click to listen to Option 2']
                      }
  var option2_trial_audio = {type:'image-button-response',
                            stimulus:plural_image_filename,
                            choices:['Click to listen to Option 2'],
                            button_html:'<button disabled class="jspsych-btn">%choice%</button>',
                            trial_duration:1000,
                            prompt:"<audio autoplay=true>\
                                    <source src='"+option2_plural_filename+"'>\
                                    </audio>"}

  var final_choice = {type:'image-button-response',
                      stimulus:plural_image_filename,
                      choices:['Option 1','Option 2'],
                      on_finish: function(data) {
                        console.log(data.response)
                        console.log(option_order)
                        if (data.response==0 & option_order=='correct_first') {
                          data.score=1
                        }
                        else if (data.response==1 & option_order=='correct_last') {
                          data.score=1
                        }
                        else {data.score=0}
                        console.log(data.score)
                      }
  }
  var feedback_trial = {type:'html-button-response',
                        stimulus:"",
                        choices:[],
                        response_ends_trial: false,
                        trial_duration: 2000,
                        post_trial_gap: 500, //a little pause between trials
                        stimulus: function() {
                          var last_trial_correct = jsPsych.data.get().last(1).values()[0].score;
                          if(last_trial_correct==1){
                            return "Correct!" }
                          else if (option_order=='correct_first') {
                            return "Incorrect! The correct response was Option 1."}
                          else if (option_order=='correct_last') {
                            return "Incorrect! The correct response was Option 2."}}}
                          

  return {timeline:[singular_trial,singular_trial_audio,
                    option1_trial,option1_trial_audio,
                    option2_trial,option2_trial_audio,
                  final_choice,feedback_trial]}
                }

/******************************************************************************/
/*** Consent, instruction trials etc ******************************************/
/******************************************************************************/


var consent_screen = {
  type: 'html-button-response',
  stimulus: "<h3>Welcome to the experiment</h3>\
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant\
  what they will be doing, how their data will be used, and how they will be remunerated.</p>\
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed\
  as part of the ethical review process.</p>",
  choices: ['Yes, I consent to participate'],
};



var final_screen = {
  type: 'html-button-response',
  stimulus: "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment, or that redirects them back to a crowdsourcing site.</p>\
  <p style='text-align:left'>This is a placeholder for that information.</p>",
  choices:["Click to finish the experiment"]
};

var preload = {
  type: 'preload',
  auto_preload: true 
}


/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
This experiment is very simple, and our timeline is just a list of the trials we
set up above. There's no randomisation, so our trials will always play in the same
order every time we run through the experiment - later we'll see how to do
randomisation.
*/
var full_timeline = [].concat(consent_screen,preload,
                              //instruction_screen_1,instruction_screen_2,
                              training_trials,final_screen);

/*
Finally we call jsPsych.init to run the timeline we have created.
Nothing fancy going on in here, except that on_finish (so after the final_screen
trial) we use a built-in function to dump the raw data on the screen. Obviously
you wouldn't do this with a real experiment, and we will show you how to save data
in a subsequent example, but this at least allows you to see what the data looks
like behind the scenes.
*/

jsPsych.init({
    timeline: full_timeline});
