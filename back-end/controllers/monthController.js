const Todo = require('../models/Calendar');

const getMonthSchedules = async (req, res) => {
    try {
        const { _id } = req.user;
        const { startDate, endDate } = req.query;

        const startOfStartDate = new Date(startDate);
        const endOfEndDate = new Date(endDate);

        const todos = await Todo.find({
            userId: _id,
            $or: [
                // Case 1: 일정이 startDate 이후이고 endDate 이전인 경우
                {
                    startDate: { $gte: startOfStartDate, $lte: endOfEndDate }
                },
                // Case 2: 일정이 startDate 이전이고 endDate 이후인 경우
                {
                    startDate: { $lte: startOfStartDate },
                    endDate: { $gte: endOfEndDate }
                },
                // Case 3: 일정이 startDate 이전이고 endDate 이후인 경우 (완전 포함되는 경우)
                {
                    startDate: { $lte: startOfStartDate },
                    endDate: { $gte: startOfStartDate }
                },
                // Case 4: 일정이 startDate 이후이고 endDate 이전인 경우 (완전 포함되는 경우)
                {
                    startDate: { $gte: startOfStartDate },
                    endDate: { $lte: endOfEndDate }
                }
            ]
        });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error });
    }
};

module.exports = {
    getMonthSchedules
}