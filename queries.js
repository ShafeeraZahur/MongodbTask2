//1.Find all the topics and tasks which are thought in the month of October.

db.zendb.aggregate([
    {
        $match: {
            $or: [
                { "users": "student" },
                { "users": "mentors" }
            ]
        }
    },
    {
        $unwind: "$topics"
    },
    {
        $unwind: "$tasks"
    },
    {
        $project: {
            "name": 1,
            "date": "$topics.date",
            "topic": "$topics.topic",
            "task": "$tasks.task",
            "month": { $month: { $dateFromString: { dateString: "$topics.date" } } }
        }
    },
    {
        $match: {
            "month": 10
        }
    }
])


//2.Find all the company drives which appeared between 15-oct-2020 and 31-oct-2020

db.zendb.find({ "company_drives.date": { $gte:'2020-10-15', $lte: '2020-10-31' } }, { "company_drives.date": 1 })

db.zendb.find({ "company_drives.date": { $gte: ISODate('2020-10-15'), $lte: ISODate('2020-10-31') } }, { "company_drives.date": 1 })


//3.Find all the placement drives and students who are appeared for the placement.

db.zendb.aggregate([
    // Unwind the array to work with company drives
    { $unwind: "$company_drives" },

    // Match to filter only the company drives where students appeared
    {
        $match: {
            "company_drives.result": { $in: ["selected", "Selected"] }
        }
    },

    // Group to retrieve the students who appeared for the company drives
    {
        $group: {
            _id: "$company_drives.name",
            students: { $push: "$name" }
        }
    }
])

//4.Find the number of problems solved by the user in codekata.

db.zendb.aggregate([
    {
        $project: {
            name: 1,
            codekata: 1,
            solved_problems: {
                $filter: {
                    input: "$tasks",
                    as: "task",
                    cond: { $eq: ["$$task.task", true] }
                }
            }
        }
    }
])

//5.Find all the mentors with who has the mentee's count more than 15.

db.zendb.find({"users":"mentors","mentee_count":{$gte:15}})


//6.Find the number of users who are absent and task is not submitted between 15-oct-2020 and 31-oct-2020 

db.zendb.aggregate([
    {
      $match: {
        $and: [
          { "attendance.date": { $gte: "2020-10-15", $lte: "2020-10-31" } },
          { "attendance.status": "A" },
          { "tasks.task": false }
        ]
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ])



