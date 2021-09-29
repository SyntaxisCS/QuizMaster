## Databases

* GuildConfig
    
    * guildId, prefix, adminRole, teacherRole, studentRole

* ServerTable (GuildId)
    * students (string of studentIds), quizzes (string of quizIds), school (name of associated school if any (default: None))

* StudentTable

    * studentId (int), tag (string), classId (int), assignedQuizzes (string of quizIds in order)
    
* QuizTable

    * quizId (int), name (string), numOfQuestions (int), questions (string of questionIds in order), active (bool), deadline (string)
    
* QuestionTable

    * questionId (int), question (string), answer (string)
    
## Commands

* addteacher <@mention>

* addstudent <@mention>

    * assignquiz <@mention> quizId

* deletestudent <id> confirm
    
* question
    
    * question create <question>,<answer>

    * question delete <id>
    
    * question view <id>
    
* (admin only) viewquestions
    return a .txt file with a list of every question in the database

* createquiz <name> <list of questionIds>

* deletequiz <id>