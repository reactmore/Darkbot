const { Model } = require('sequelize');
const { DATABASE } = require('../config');

class BaseModel extends Model {

    static async model_save(data, id = 0) {
        try {
            if (id) {
                const [updatedCount] = await this.update(data, { where: { id } });
                if (updatedCount > 0) {
                    const updatedData = await this.findByPk(id);
                    return updatedData.id;
                }
                return false;
            } else {
                const newData = await this.create(data);
                return newData.id;
            }
        } catch (error) {
            // console.error('Error in model_save:', error);
            return false;
        }
    }

    static async isDataUnique(key, value, idForCompare = 0) {
        try {
            const data = await this.getDataByKey(key, value, 'object');

            if (idForCompare === 0) {
                return data ? false : true;
            } else {
                return data && data.id !== idForCompare ? false : true;
            }
        } catch (error) {
            console.error('Error in isDataUnique:', error);
            return false;
        }
    }

    static async getDataByKey(key = 'id', value = null, returnType = 'array', limit = 1) {
        try {
            const whereClause = {};
            whereClause[key] = value;

            if (limit === 1) {
                const data = await this.findOne({ where: whereClause });
                if (returnType === 'array') {
                    return data ? [data.get({ plain: true })] : [];
                } else {
                    return data ? data.get({ plain: true }) : null;
                }
            } else {
                const options = {
                    where: whereClause,
                    limit: limit,
                };

                const data = await this.findAll(options);

                if (returnType === 'array') {
                    return data.map(record => record.get({ plain: true }));
                } else {
                    return data.length > 0 ? data[0].get({ plain: true }) : null;
                }
            }
        } catch (error) {
            console.error('Error in getDataByKey:', error);
            return returnType === 'array' ? [] : null;
        }
    }
}

BaseModel.init({}, { sequelize: DATABASE });

module.exports = BaseModel;