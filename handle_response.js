export function handleUserAnswer(user, msg) {
	const { telegramId } = parseMsg(msg);
	return new Promise((resolve, reject) => {
		const answer = msg.text;
		const questionId = answer.match(/(\w+)--/)[1];
		const answerIndex = answer.match(/--(\d+)/)[1];

		if (alreadyAnswered(user, questionId)) {
			return resolve();
		}

		if (user.status === "with-question") {
			logger.info("Gamer %s, answer: %s", telegramId, msg);
			setNextStatus(user);
			const checkedQuestionId = R.compose(
				R.find(R.equals(questionId)),
				R.map(R.toString),
				R.pluck("questionnaireId")
			)(user.answers);

			Question.findById(checkedQuestionId)
				.then(questionnaire => {
					const isCorrect = compareAnswer(questionnaire, answerIndex);
					const newAnswer = makeGamerAnswer(
						questionnaire,
						answerIndex,
						isCorrect
					);
					logger.info(
						"Gamer %s, isCorrect=%s, newAnswer=%s",
						telegramId,
						isCorrect,
						newAnswer
					);
					// Так как не обновляется значение объекта в массиве, приходится делать это отдельно
					// Далее пользователь обновляется для изменения статуса
					updateUserAnswer(user._id, newAnswer)
						.then(_ => {
							updateUser(user)
								.then(updatedUser => {
									logger.info(
										"Gamer %s updated to %s",
										telegramId,
										updatedUser
									);
									const { answers = [] } = user;
									//Чтобы не вычитывать пользователя из БД и т.к. в user.answers на данном этапе хранится на один вопрос
									//меньше, чем реально отвечено, а ответ на последний вопрос находится в newAnswer в isCorrect, то добавляем доп. проверку
									const score =
										countCorrectAnswers(answers) + (isCorrect ? 1 : 0);
									let scoreMsg = "";
									if (score == SIMPLE_PRIZE_SCORE && isCorrect) {
										scoreMsg +=
											"\n\nВы набрали балл, достаточный для получения подарка. Покажите это сообщение сотрудникам на стойке Сбертеха и получите его.\nПродолжайте участвовать и вы сможете получить более крутые призы!";
									}
									if (isTestAvailableByTime()) {
										resolve({
											id: telegramId,
											msg: `Ответ принят, спасибо! Следующее обновление придет автоматически.${scoreMsg}`
										});
									} else {
										resolve({
											id: telegramId,
											msg: `Ответ принят, спасибо!.\nК сожалению, бот активен только во время конференции, сейчас он недоступен.${scoreMsg}`
										});
									}
								})
								.catch(err => {
									logger.info(err);
									reject({
										id: telegramId,
										msg:
											"Произошла ошибка. Обратитесь на стойку к сотрудникам Сбертеха."
									});
								});
						})
						.catch(err => {
							logger.error(err);
							reject({
								id: telegramId,
								msg:
									"Произошла ошибка. Обратитесь на стойку к соткрудникам Сбертеха."
							});
						});
				})
				.catch(err => {
					logger.error(err);
					reject({
						id: telegramId,
						msg: "Произошла ошибка. Обратитесь на стойку к hr."
					});
				});
		}
	});
}