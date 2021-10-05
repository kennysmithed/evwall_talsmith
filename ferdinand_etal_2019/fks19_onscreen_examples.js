
var object2_show = {type:'image-button-response',
                    stimulus:'object2.jpg',
                    trial_duration:1000,
                    choices:[]}

var object2_train = {type:'image-button-response',
                     stimulus:'object2.jpg',
                     prompt: 'vit',
                     trial_duration:2000,
                     choices:[]}

var object4_show = {type:'image-button-response',
                    stimulus:'object4.jpg',
                    trial_duration:1000,
                    choices:[]}

var object4_train = {type:'image-button-response',
                     stimulus:'object4.jpg',
                     prompt: 'dap',
                     trial_duration:2000,
                     choices:[]}

var training_timeline = [object2_show,object2_train,object4_show,object4_train]

var object2_test = {type:'image-button-response',
                    stimulus:'object2.jpg',
                    choices: ['lem','vit']}

var object2_confirm = {type:'image-button-response',
                       stimulus:'object2.jpg',
                       choices: [],
                       on_start:function(trial) {
                         var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                         trial.choices=[last_trial_label]}}

var object2_display = {type:'image-button-response',
                       stimulus:'object2.jpg',
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.prompt=last_trial_label}}

var object4_test = {type:'image-button-response',
                    stimulus:'object4.jpg',
                    choices: ['mig','dap']}

var object4_confirm = {type:'image-button-response',
                       stimulus:'object4.jpg',
                       choices: [],
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.choices=[last_trial_label]}}

var object4_display = {type:'image-button-response',
                       stimulus:'object4.jpg',
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.prompt=last_trial_label}}
