// Mapping Rating Table
module.exports = (sequelize, DataTypes) => (
    sequelize.define('rating', {
        user_uid: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        bsin: {
            type: DataTypes.STRING(100),
            allowNull: false,
        }, 
        genre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    }, {
        timestamps: true, // 생성&수정일 기록
        paranoid: true, // 삭제일 기록
    })
);