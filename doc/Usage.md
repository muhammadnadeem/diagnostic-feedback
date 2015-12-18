Authoring a BuzzFeed Style Quiz
-------------------------------

In BuzzFeed style quiz, an author can create an assessment quiz with multiple
choice questions. The results for this assessment are defined as categories,
which are assigned against choices for each question. When a choice is selected
as the answer to a question, the respective category gets a +1 score. In the end,
the category with the highest score is concluded as the final result and is
displayed to the student as a feedback to her quiz choices.

The authoring supports creation of interleaved sub-quizzes through association
of the categories and subsequently the related questions to a user-defined group(s).
This allows the author to provide feedback to the students on more than one particular
dimension. Tangibly, this results in the aggregation of feedback for each group at the
end of the quiz. This will hopefully become clear with an example later in this document.


See [BuzzFeed Style Quiz] (BuzzFeed_Style.md)


Authoring a Diagnostic Style Quiz
---------------------------------

In Diagnostic quiz, an author can create an assessment quiz with multiple choice questions.
The results for this assessment are defined as ranges, which are assigned minimum and maximum
each. Choices for each question are assigned respective numeric values. The values for selected
choices against each question are added up and compared against each range to determine the feedback.
The input validation provide ample warnings if any combination of choices lie outside all defined
ranges. While ranges with overlapping min and max values are strictly not allowed.

The authoring also supports creation of interleaved sub-quizzes through association of the ranges and
subsequently the related questions to user-defined groups. This allows the author to provide feedback
to the students on more than one particular dimension. Tangibly, this results in the aggregation of
feedback for each group at the end of the quiz.

A quiz with more than one group will have range definition rules applied independently for each group,
i.e. two ranges can have same or overlapping min max values if they belong to two different groups.


See [Diagnostic Style Quiz]  (Diagnostic_Style.md)
