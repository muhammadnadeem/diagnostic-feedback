Diagnostic Feedback
--------------------

This repository provides Diagnostic Feedback Authoring XBlock.

This xblock allows the author to create a series of questions which will assess
and subsequently provide feedback to the student attempting the published quiz.

The xblock provides two types assessments:
* Range Based (Diagnostic)
* Category Based (Like Buzzfeed)

In both, a student is asked to answer multiple choice questions and depending
on her answers, she is classified into one of the defined range or category,
and the associated feedback is displayed to the her.

* In range based (Diagnostic) quiz, first a result is defined as a range, e.g:

    Efficient team (0-5 points)
    Mediocre team (6-9 points)
    Awful team (10-15 points)

  Then each choice within each question is given a numeric value. When the student
  attempts a quiz, the values against all her selected choices are added together
  and compared against each range to determine the appropriate feedback to be shown.

* In category based (Like Buzzfeed), each result is defined as a category and
  each choice within each question is associated with one of the defined categories.
  Finally when the student completes a quiz, frequency of each category against
  selected choices is calculated and the result against the most frequent category
  is displayed as the feedback.

  For example with with categories defined as A, B and C:

    More A answers than any other: You are Small!
    More B answers than any other: You are Medium!
    More C answers than any other: You are Large!

Usage
-----

You can enable the Diagnostic Feedback XBlocks in Studio by modifying the
advanced settings for your course:

1. From the main page of a specific course, navigate to **Settings** ->
   **Advanced Settings** from the top menu.
2. Find the **Advanced Module List** setting.
3. To enable Diagnostic Feedback for your course, add `"diagnostic-feedback "` to 
   the modules listed there.
5. Click **Save changes** button.

Installation
------------

Install the requirements into the Python virtual environment of your
`edx-platform` installation by running the following command from the
root folder:

```bash
$ pip install -r requirements.txt
```

Running tests
-------------

First of all, make sure the [XBlock SDK (Workbench)](https://github.com/edx/xblock-sdk)
is installed in the same virtual environment as xblock-diagnostic-feedback.

From the xblock-diagnostic-feedback repository root, run the tests with the
following command:

```bash
$ ./run_tests.py
```

