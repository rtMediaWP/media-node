var api = require('./lib/api.js')
var queue = require('./lib/queue.js')
var util = require('./lib/util.js')

//config
var env = process.env.NODE_ENV || "development"
var config = require(__dirname + '/config.json')[env]

//make sure upload folder exist
util.makedir(config.folder);

//fetch new jobs via API
api.getjobs(function(res) {
    //process new jobs found in API
    console.log("===================================================")
    console.log("START processing queue")
    console.log("===================================================")
    queue.encode(res, function(job) {
            //update bandwidth
            api.updatejob(job.api_job_id, 'bandwidth', job.bandwidth, function() {
                // update remote API
                api.updatejob(job.api_job_id, 'duration', job.duration, function() {
                    //update job status at API
                    api.updatejob(job.api_job_id, 'job_status', job.status, function() {
                        //update out_file_location
                        api.updatejob(job.api_job_id, 'out_file_location', job.original_file_url, function() {
                            //fire callback
                            api.callback(job)
                        })
                    })
                })
            })
        })
        // queue.process();
})