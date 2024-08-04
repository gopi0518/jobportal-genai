CREATE TABLE `careerguide` (
  `title` STRING,
  `paths` ARRAY < ROW <
    `title` STRING,
    `rec_courses` STRING
    > >,
  PRIMARY KEY (`title`) ENFORCED
);