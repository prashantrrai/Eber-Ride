const express = require('express')
const ridehistoryRouter = new express.Router()


        // ------------------------------------------------DOWNLAOD DATA IN CSV FROM RIDE-HISTORY TABLE-----------------------------------------------//
        ridehistoryRouter.post("downloadridehistory", async (req,res) => {

            console.log(filterdata);
            console.log(req.body);

            try {
  
              let page = +filterdata.page || 1;
              let limit = +filterdata.limit || 5;
              let paymentFilter = filterdata.payment;
              let fromdate = filterdata.fromdate;
              let todate = filterdata.todate;
              let startLocationSearch = filterdata.startlocationsearch;
              let endLocationSearch = filterdata.endlocationsearch;
              let statusfilter = +filterdata.status;
              let skip = (page - 1) * limit;
  
              console.log(filterdata);
  
  
              const matchCriteria = [];
              
              if (statusfilter !== -1) {
                matchCriteria.push({ status: { $in: [statusfilter] } });
              }else if (statusfilter === -1) {
                matchCriteria.push({ status: { $nin: [1,2,4,5,6] } });
              }
  
              if (paymentFilter !== '') {
                matchCriteria.push({ paymentOption: paymentFilter });
              }
  
  
  
              if (startLocationSearch || endLocationSearch) {
                const matchStage = {};
              
                if (startLocationSearch && endLocationSearch) {
                  matchStage.$and = [
                    { startLocation: { $regex: startLocationSearch, $options: "i" } },
                    { endLocation: { $regex: endLocationSearch, $options: "i" } }
                  ];
                } else if (startLocationSearch) {
                  matchStage.startLocation = { $regex: startLocationSearch, $options: "i" };
                } else if (endLocationSearch) {
                  matchStage.endLocation = { $regex: endLocationSearch, $options: "i" };
                }
              
                matchCriteria.push(matchStage);
              }
  
              // Date range filter logic
              if (fromdate && todate) {
              
                matchCriteria.push({
                  rideDate: {
                    $gte: fromdate,
                    $lte: todate
                  }
                });
              }
              console.log(matchCriteria);
  
              if (matchCriteria.length === 0) {
                matchCriteria.push({});
              }
              
   
              const aggregationPipeline = [
  
                {
                  $lookup: {
                    from: 'usermodels',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                  }
                },
                {
                  $unwind: "$userDetails"
                },
                {
                  $lookup: {
                    from: 'citymodels',
                    localField: 'cityId',
                    foreignField: '_id',
                    as: 'cityDetails'
                  }
                },
                {
                  $unwind: "$cityDetails"
                },
                {
                  $lookup: {
                    from: 'countrymodels',
                    localField: 'cityDetails.country_id',
                    foreignField: '_id',
                    as: 'countryDetails'
                  }
                },
                {
                  $unwind: "$countryDetails"
                },
                {
                  $lookup: {
                    from: 'vehiclemodels',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'vehicleDetails'
                  }
                },
                {
                  $unwind: "$vehicleDetails"
                },
                {
                  $lookup: {
                    from: "drivermodels",
                    localField: "driverId",
                    foreignField: "_id",
                    as: "driverDetails"
                  }
                },
                {
                  $unwind: {
                    path: "$driverDetails",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $match: {
                    $and: [
                      ...matchCriteria,
                      // matchStage,
                      {
                        status: { $in: [3, 7] }
                      }
                    ]
                  },
                },
          
                {
                  $facet: {
                    ridehistory: [
                      { $skip: skip },
                      { $limit: limit },
                    ],
                    totalCount: [{ $count: "count" }],
                  },
                },
              ];
  
              const ridesdata = await createrideModel.aggregate(aggregationPipeline).exec()
              // console.log(ridesdata);
              const myridehistory = ridesdata[0]?.ridehistory || [];
              console.log(myridehistory);
  
              const totalCount = ridesdata[0]?.totalCount[0]?.count || 0;
              const totalPages = Math.ceil(totalCount / limit);
          
              if (page > totalPages) {
                page = totalPages;
                skip = (page - 1) * limit;
              }
          
              io.emit('ridehistorydata', { success: true, message: "Ride History Data Found", myridehistory, page, limit, totalPages, totalCount });
  
            } catch (error) {
              console.error(error);
              io.emit('ridehistorydata', { success: false, message: "Ride History Data Not Found", error: error.message });
            }
          });
  
  