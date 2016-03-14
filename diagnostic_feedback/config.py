student_assets = {
    'css': [
        ('public/css/jquery.steps.css', 0),
        ('public/css/message.css', 1),
        ('public/css/student_style.css', 2)
    ],
    'js': [
        ('public/js/libs/jquery.steps.js', 0),
        ('public/js/src/common.js', 1),
        ('public/js/src/student/student_quiz.js', 2)
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
        # libs
        ('https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.12.0/jquery.validate.min.js', 0),
        ('public/js/libs/jquery.steps.js', 1),

        # wizard related
        ('public/js/src/setting.js', 2),
        ('public/js/src/common.js', 3),
        ('public/js/src/studio/studio_common.js', 4),
        ('public/js/src/studio/studio_validator.js', 5),
        ('public/js/src/studio/quiz.js', 6),
    ],
    'js_classes': [
        ('Setting', 0),
        ('StudioCommon', 1),
        ('CustomValidator', 2),
        ('Quiz', 3),
    ],
    'templates': [
        ('templates/studio/wizard.html', 0)
    ]
}
