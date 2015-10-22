student_assets = {
    'css': [
        ('public/css/jquery.steps.css', 0),
        ('public/css/message.css', 1),
        ('public/css/student_style.css', 2)
    ],
    'js': [
        ('http://ajax.aspnetcdn.com/ajax/jquery.validate/1.12.0/jquery.validate.min.js', 0),
        ('public/js/libs/jquery.steps.js', 1),
        ('public/js/src/common.js', 2),
        ('public/js/src/student/student_quiz.js', 3)
    ],
    'js_classes': [
        ('Common', 0),
        ('StudentQuiz', 1)
    ],
    'templates': [
        ('templates/student/quiz.html', 0),
    ]

}

studio_assets = {
    'css': [
        ('public/css/jquery.steps.css', 0),
        ('public/css/tooltip.css', 0),
        ('public/css/studio_style.css', 1),
        ('public/css/message.css', 2)
    ],
    'js': [
        #libs
        ('http://ajax.aspnetcdn.com/ajax/jquery.validate/1.12.0/jquery.validate.min.js', 0),
        ('public/js/libs/jquery.steps.js', 1),
        ('public/js/libs/underscore.js', 2),
        # wizard related
        ('public/js/src/setting.js', 3),
        ('public/js/src/common.js', 4),
        ('public/js/src/studio/studio_common.js', 5),
        ('public/js/src/studio/studio_validator.js', 6),
        ('public/js/src/studio/quiz.js', 7),
        ('public/js/src/studio/event_handlers.js', 8),
    ],
    'js_classes': [
        ('Setting', 0),
        ('StudioCommon', 1),
        ('CustomValidator', 2),
        ('EventHandler', 3),
        ('Quiz', 4),
    ],
    'templates': [
        ('templates/studio/wizard_start.html', 0),
        ('templates/studio/step1.html', 1),
        ('templates/studio/step2.html', 2),
        ('templates/studio/step3.html', 3),
        ('templates/studio/wizard_end.html', 4),
    ]
}

