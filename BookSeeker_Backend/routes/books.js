// 웹 프레임워크
const express = require('express');

// 프로미스 기반 ORM(Objective-Relational Mapping)
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/server_info.json')[env];

// 모델 및 미들웨어 선언
const { Book, BookHistory } = require('../models');
const { clientIp, isLoggedIn } = require('./middlewares');

// 로그 생성
const winston = require('../config/winston');

//라우터
const router = express.Router();

// Raw query 작성에 필요한 sequelize 변수 선언
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

// 도서 검색
router.post('/search/:filter/:page/:limit', clientIp, isLoggedIn, async (req, res, next) => {
    try {
        const user_email = req.user.email;

        const filter = parseInt(req.params.filter);
        const page = parseInt(req.params.page);
        const limit = parseInt(req.params.limit);
        const keyword = req.body.keyword;

        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] 도서 검색 Request`);
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] filter : ${filter}, page : ${page}, limit : ${limit}, keyword : ${keyword}`);

        let offset = 0;
        let order = 'publication_date ASC';

        if (page > 1) {
            offset = 10 * (page - 1);
        }

        // 필터에 따라 정렬 기준 변경
        // 최신순, 오래된 순, 가나다 순
        if (filter == 0) {
            order = 'publication_date ASC';
        } else if (filter == 1) {
            order = 'publication_date DESC';
        } else {
            order = 'title ASC';
        }

        // 페이징 적용
        const bookList = await Book.findAll({
            offset: offset,
            limit: limit,
            order: Sequelize.literal(order),
            where: {
                title: {
                    [Op.like]: "%" + keyword + "%"
                }
            }
        });

        // 도서 검색 성공 메세지 반환
        const result = new Object();
        result.success = true;
        result.data = bookList;
        result.message = '도서 검색을 성공했습니다.';
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
        return res.status(200).send(result);
    } catch (e) {
        winston.log('error', `[BOOK][${req.clientIp}|${req.body.email}] 전체 만화 목록 조회 Exception`);

        const result = new Object();
        result.success = false;
        result.data = 'NONE';
        result.message = 'INTERNAL SERVER ERROR';
        winston.log('error', `[BOOK][${req.clientIp}|${req.body.email}] ${result.message}`);
        res.status(500).send(result);
        return next(e);
    }
});

// 전체 만화|판타지|로맨스 목록 조회
router.get('/:genre/:filter/:page/:limit', clientIp, isLoggedIn, async (req, res, next) => {
    try {
        const user_email = req.user.email;
        const user_uid = req.user.user_uid;

        const genre = req.params.genre;
        const filter = parseInt(req.params.filter);
        const page = parseInt(req.params.page);
        const limit = parseInt(req.params.limit);

        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] 전체 ${genre} 목록 조회 Request`);
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] genre: ${genre}, filter : ${filter}, page : ${page}, limit : ${limit}`);

        let offset = 0;

        // 랜덤으로 페이지를 불러오는 경우
        if (filter == 0) {
            // 요청받은 페이지가 2 이상인 경우
            if (page > 1) {
                // offset 설정
                offset = 10 * (page - 1);

                // 임시 테이블에 데이터를 제외한 페이징 적용 데이터 불러오기
                let query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre AND ' +
                    'bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM bookhistories ' +
                    'WHERE user_uid=:user_uid' +
                    ') AND bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY rand() ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';

                const bookList = await sequelize.query(query, {
                    replacements: {
                        user_uid: user_uid,
                        genre: genre,
                        limit: limit,
                        offset: offset
                    },
                    type: Sequelize.QueryTypes.SELECT,
                    raw: true
                });

                // 불러온 데이터를 임시 테이블에 저장
                for (let i = 0; i < bookList.length; i++) {
                    await BookHistory.create({
                        user_uid: user_uid,
                        title: bookList[i].title,
                        bsin: bookList[i].bsin,
                        genre: bookList[i].genre
                    });
                }

                // 전체 도서 목록 조회 성공 메세지 반환
                const result = new Object();
                result.success = true;
                result.data = bookList;
                result.message = `전체 ${genre} 목록 조회를 성공했습니다.`;
                winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
                return res.status(200).send(result);
            }
            // 요청받은 페이지가 1인 경우
            else {
                // 임시 테이블에 저장한 데이터 전부 삭제
                await BookHistory.destroy({
                    where: {
                        user_uid: user_uid,
                        genre: genre
                    }
                });

                // 페이징 적용 데이터 불러오기(내가 평가하지 않은 도서)
                let query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre ' +
                    'AND bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY rand() ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';

                const bookList = await sequelize.query(query, {
                    replacements: {
                        user_uid: user_uid,
                        genre: genre,
                        limit: limit,
                        offset: offset
                    },
                    type: Sequelize.QueryTypes.SELECT,
                    raw: true
                });

                // 불러온 데이터를 임시 테이블에 저장
                for (let i = 0; i < bookList.length; i++) {
                    await BookHistory.create({
                        user_uid: user_uid,
                        title: bookList[i].title,
                        bsin: bookList[i].bsin,
                        genre: bookList[i].genre
                    });
                }

                // 전체 도서 목록 조회 성공 메세지 반환
                const result = new Object();
                result.success = true;
                result.data = bookList;
                result.message = `전체 ${genre} 목록 조회를 성공했습니다.`;
                winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
                return res.status(200).send(result);
            }
        }
        // 그 외의 경우
        else {
            let query = '';
            // 정렬 기준 설정
            if (filter == 1) {
                query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre AND ' +
                    'bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY publication_date DESC ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';

                order = 'publication_date ASC';
            } else if (filter == 2) {
                query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre AND ' +
                    'bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY publication_date ASC ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';

                order = 'publication_date DESC';
            } else if (filter == 3) {
                query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre AND ' +
                    'bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY title ASC ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';
            } else {
                query =
                    'SELECT * ' +
                    'FROM books ' +
                    'WHERE genre=:genre AND ' +
                    'bsin NOT IN(' +
                    'SELECT bsin ' +
                    'FROM evaluations ' +
                    'WHERE user_uid=:user_uid ' +
                    'AND deletedAt IS NULL) ' +
                    'ORDER BY title DESC ' +
                    'LIMIT :limit ' +
                    'OFFSET :offset;';
            }

            // 임시 테이블에 저장한 데이터 전부 삭제
            await BookHistory.destroy({
                where: {
                    user_uid: user_uid
                }
            });

            // 요청받은 페이지가 2 이상인 경우
            if (page > 1) {
                // offset 설정
                offset = 10 * (page - 1);
            }

            // 페이징 적용 데이터 불러오기(내가 평가하지 않은 도서)
            const bookList = await sequelize.query(query, {
                replacements: {
                    user_uid: user_uid,
                    genre: genre,
                    limit: limit,
                    offset: offset
                },
                type: Sequelize.QueryTypes.SELECT,
                raw: true
            });

            // 전체 도서 목록 조회 성공 메세지 반환
            const result = new Object();
            result.success = true;
            result.data = bookList;
            result.message = `전체 ${genre} 목록 조회를 성공했습니다.`;
            winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
            return res.status(200).send(result);
        }
    } catch (e) {
        winston.log('error', `[BOOK][${req.clientIp}|${req.body.email}] 전체 도서 목록 조회 Exception`);

        const result = new Object();
        result.success = false;
        result.data = 'NONE';
        result.message = 'INTERNAL SERVER ERROR';
        winston.log('error', `[BOOK][${req.clientIp}|${req.body.email}] ${result.message}`);
        res.status(500).send(result);
        return next(e);
    }
});

// 개별 도서 조회
router.get('/:bsin', clientIp, isLoggedIn, async (req, res, next) => {
    try {
        const user_email = req.user.email;
        const user_uid = req.user.user_uid;

        const bsin = parseInt(req.params.bsin);

        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] 개별 도서 조회 Request`);
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}]  bsin: ${bsin}`);

        let query =
            'SELECT b.*, e.rating, e.state, e.count, e.average ' +
            'FROM (' +
            'SELECT IFNULL(e1.rating, -1) AS rating, IFNULL(e1.state, -1) AS state, COUNT(e2.bsin) AS count, IFNULL(AVG(e2.rating), 0) as average ' +
            'FROM (' +
            'SELECT * ' +
            'FROM evaluations ' +
            'WHERE user_uid=:user_uid ' +
            'AND bsin=:bsin ' +
            'AND deletedAt IS NULL' +
            ') AS e1 ' +
            'LEFT OUTER JOIN (' +
            'SELECT * ' +
            'FROM evaluations ' +
            'WHERE rating > 0 ' +
            'AND deletedAt IS NULL' +
            ') AS e2 ' +
            'ON e1.bsin = e2.bsin' +
            ') as e ' +
            'LEFT OUTER JOIN ' +
            'books AS b ' +
            'ON b.bsin=:bsin;';

        const book = await sequelize.query(query, {
            replacements: {
                bsin: bsin,
                user_uid: user_uid
            },
            type: Sequelize.QueryTypes.SELECT,
            raw: true
        });

        // 도서 평균 평점, 인원 수 조회
        let averageQuery =
            'SELECT IFNULL(AVG(rating), 0) as average, COUNT(bsin) AS count ' +
            'FROM evaluations ' +
            'WHERE bsin=:bsin ' +
            'AND rating > 0 ' +
            'AND deletedAt IS NULL';

        const average = await sequelize.query(averageQuery, {
            replacements: {
                bsin: bsin
            },
            type: Sequelize.QueryTypes.SELECT,
            raw: true
        });

        book[0].average = average[0].average.toFixed(1);
        book[0].count = average[0].count;

        // 도서 검색 성공 메세지 반환
        const result = new Object();
        result.success = true;
        result.data = book;
        result.message = '개별 도서 조회를 성공했습니다.';
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
        return res.status(200).send(result);
    } catch (e) {
        winston.log('error', `[BOOK][${req.clientIp}|${req.user.email}] 개별 도서 조회 Exception`);

        const result = new Object();
        result.success = false;
        result.data = 'NONE';
        result.message = 'INTERNAL SERVER ERROR';
        winston.log('error', `[BOOK][${req.clientIp}|${req.user.email}] ${result.message}`);
        res.status(500).send(result);
        return next(e);
    }
});

// 도서 평가 키워드 조회
router.get('/keyword/:limit', clientIp, isLoggedIn, async (req, res, next) => {
    try {
        const user_email = req.user.email;
        const user_uid = req.user.user_uid;

        const limit = req.params.limit;

        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] 도서 평가 키워드 조회 Request`);
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] limit : ${limit}`);

        let query =
            'SELECT b.keyword ' +
            'FROM books AS b, evaluations AS e ' +
            'WHERE user_uid=:user_uid ' +
            'AND b.bsin = e.bsin ' +
            'AND e.deletedAt IS NULL ' +
            'ORDER BY e.createdAt DESC ' +
            'LIMIT 100 ';


        const userEvaluationKeyword = await sequelize.query(query, {
            replacements: {
                user_uid: user_uid
            },
            type: Sequelize.QueryTypes.SELECT,
            raw: true
        });

        // keywordList : 키워드와 개수가 저장될 배열
        // returnData : 프론트에 반환할 결과값이 들어갈 배열
        let keywordList = [], returnData = [];

        for (let i = 0; i < userEvaluationKeyword.length; i++) {
            let keyword = userEvaluationKeyword[i].keyword.split("#");

            for (let j = 0; j < keyword.length; j++) {
                console.log(keyword[j]);
                // 해당 키워드가 배열에 없는 경우
                if (!keywordList[keyword[j]]) {
                    keywordList[keyword[j]] = 0;
                    keywordList[keyword[j]]++
                }
                // 키워드 개수에 따라 증가
                keywordList[keyword[j]]++;
            }
        }

        // 키워드 목록을 결과 배열에 넣고 내림차순으로 정렬 후 40개로 컷
        for (let keyword in keywordList) {
            returnData.push({ keyword: keyword, size: keywordList[keyword] });
        }
        returnData.sort((a, b) => b.size - a.size);
        returnData.splice(limit);

        // 도서 검색 성공 메세지 반환
        const result = new Object();
        result.success = true;
        result.data = returnData;
        result.message = '도서 평가 키워드 조회를 성공했습니다.';
        winston.log('info', `[BOOK][${req.clientIp}|${user_email}] ${result.message}`);
        return res.status(200).send(result);
    } catch (e) {
        winston.log('error', `[BOOK][${req.clientIp}|${req.user.email}] 도서 평가 키워드 조회 Exception`);

        const result = new Object();
        result.success = false;
        result.data = 'NONE';
        result.message = 'INTERNAL SERVER ERROR';
        winston.log('error', `[BOOK][${req.clientIp}|${req.user.email}] ${result.message}`);
        res.status(500).send(result);
        return next(e);
    }
});

module.exports = router;