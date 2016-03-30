var HIG = {};

define(function (require) {

    "use strict";

    var $ = require("jquery");

    (function(){

        HIG.quiz = [];

        var tellParentToResizeIframe = function(){
            var payload = [{event: 'resize', height: $('body').height()}];
            if (window.top) {
                window.top.postMessage(JSON.stringify(payload), '*');
            }
        };

        setTimeout(function () {
            tellParentToResizeIframe();
        }, 1500);


        var $video = document.getElementsByTagName("video")[0];

        function stopVideo(){
            try {
                $video.stop();
            } catch (e){
                log(e.message);
            }
        }

        function disableAnswers($question){
            $question.find("input").attr("disabled", "disabled");
        }

        function cueVideo(videoId){
            try {
                document.getElementById("vid-source").src = "ui/videos/" + videoId;
                $video.load();
            } catch (e){
                log(e.message);
            }
        }

        function playVideo(){
            try {
                $video.play();
            } catch (e){
                log(e.message);
            }
        }

        function registerAnswer($question){
            var currentQuestionNumber;
            var markerClass;
            var correctAnswer = $question.data("correct");
            var answered = parseInt($question.data('answered'), 10);
            HIG.quiz.push(answered === correctAnswer);
            markerClass = (answered === correctAnswer) ? "correct" : "incorrect";
            $question.find("input").eq(correctAnswer).closest(".media").addClass("correct");
            // update this question's marker with correct/incorrect
            currentQuestionNumber = $(".question").index($question[0]);
            $(".marker > span").eq(currentQuestionNumber).addClass(markerClass);
        }

        function showNextQuestion(target){
            var $thisQuestion = $(target).closest(".question");
            var $nextQuestion = $thisQuestion.next(".question");
            $(".marker").find("span.active").next("span").addClass("active");
            $thisQuestion.hide();
            $nextQuestion.fadeIn();
            return $nextQuestion;
        }

        function showResults(target){
            var $thisQuestion = $(target).closest(".question");
            var $nextQuestion = $thisQuestion.next(".question");
            $(".marker").find("span.active").next("span").addClass("active");
            var correctAnswers = HIG.quiz.filter(function(answer){return answer === true;});
            $thisQuestion.hide();
            $nextQuestion.find(".correct").text(correctAnswers.length);
            $nextQuestion.fadeIn();
            return $nextQuestion;
        }


        // SetUp Listeners::

        $(".start-quiz").on('click', ".btn", function(ev){
            ev.preventDefault();
            $(".video-cover").show();
            stopVideo();
            $(".start-quiz").hide();
            $(".page-header .marker").show();
            $(".intro").fadeOut();
            $(".quiz-body").show().find(".question").eq(0).fadeIn(400, function(){
                cueVideo($(this).data('video-id'));
                tellParentToResizeIframe();
            });
        });

        $(".question")
            .on('change', "input", function(){
                var $thisQuestion = $(this).closest(".question");
                $thisQuestion.data('answered',$(this).val());
                $thisQuestion.find(".button-container > .view-answer").css("visibility","visible");
            })
            .on('click', ".view-answer", function(ev){
                ev.preventDefault();
                var $question = $(ev.target).closest(".question");
                stopVideo();
                registerAnswer($question);
                disableAnswers($question);
                $(".video-cover").fadeOut('slow');
                playVideo();
                // hide view-answer button
                $(ev.target).hide();
                // show go to next question button
                $(ev.target).next(".btn").show().css("display","inline-block");
                tellParentToResizeIframe();
            })
            .on('click', ".next-question", function(ev){
                ev.preventDefault();
                var $question;
                stopVideo();
                $question = showNextQuestion(ev.target);
                $(".video-cover").show();
                cueVideo($question.data('video-id'));
                tellParentToResizeIframe();
            })
            .on('click', ".view-results", function(ev){
                ev.preventDefault();
                var $question = $(ev.target).closest(".question");
                stopVideo();
                //registerAnswer($question);
                $question = showResults(ev.target);
                cueVideo($question.data('video-id'));
                $(".video-cover").hide();
                playVideo();
                $(".final-content").fadeIn();
                tellParentToResizeIframe();
            });


        //Auto Play on Load
        //var v = document.getElementsByTagName("video")[0];
        $video.addEventListener("seeked", function() { document.getElementsByTagName("video")[0].play(); }, true);
        $video.currentTime = 10.0;


    }());
});
