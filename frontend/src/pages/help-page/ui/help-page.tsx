import styles from "./help-page.module.css";
import noteIcon from "/note-icon.svg";

export function HelpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src="/bg-image.png" alt="background" />
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Начало работы</h2>
              <h3 className={styles.cardSubtitle}>
                Как начать участвовать в хакатоне:
              </h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Выберите хакатон в списке доступных
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Заполните анкету — это откроет для вас участников, команды и
                  фильтры.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Анкета — это ваш основной профиль, по которому вас будут
                  находить команды.
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: заполните анкету полностью — это сильно увеличивает шанс
                попасть в команду.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Профиль участника (анкета)</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Роль (Frontend, Backend, Designer и т.д.)
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Навыки и технологии</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Опыт (junior/middle/senior)</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Короткое описание о себе</p>
              </div>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>Зачем это нужно:</p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вашу анкету видят другие участники
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вам будут приходить приглашения
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вас смогут находить по фильтрам
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: выбирайте навыки честно — слишком широкий стек может
                отпугнуть капитанов.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Поиск команды</h2>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>Где искать людей:</p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Раздел "Участники" показывает всех участников хакатона.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Используйте фильтры:</p>
              </div>
              <div className={styles.nestedSteps}>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>по ролям</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>по навыкам</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>по уровню опыта</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>
                    по статусу (в команде / свободен)
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>Что можно делать:</p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Открывать профиль участника</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Смотреть навыки и роль</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Отправлять приглашения (если вы капитан или создаёте команду)
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: ищите людей не только по ролям, но и по стеку — это
                помогает точнее собрать команду.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Моя команда</h2>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>Если вы создали команду:</p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вы автоматически становитесь капитаном.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Вам доступны действия:</p>
              </div>
              <div className={styles.nestedSteps}>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>приглашать участников</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>принимать/отклонять запросы</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>удалять участников</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>
                    редактировать описание команды
                  </p>
                </div>
                <div className={styles.step}>
                  <span className={styles.nestedBullet}>○</span>
                  <p className={styles.stepText}>указывать открытые роли</p>
                </div>
              </div>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>
                Если вы участник команды:
              </p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Вы видите состав команды</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>Можете выйти из команды</p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Можете просматривать приглашения
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: заполняйте описание команды — участники чаще откликаются
                на понятные проекты.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Приглашения и вступление</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вы можете отправить приглашение человеку
                </p>
              </div>
              <p className={styles.stepTextIndented}>
                Если он свободен и вы — капитан или создатель команды.
              </p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вы можете получить приглашение от команды
                </p>
              </div>
              <p className={styles.stepTextIndented}>
                И принять или отклонить его.
              </p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Вы можете отправить запрос на вступление в команду
                </p>
              </div>
              <p className={styles.stepTextIndented}>
                Если у команды открытый набор.
              </p>
            </div>
            <div className={styles.subsection}>
              <p className={styles.subsectionTitle}>Важные моменты:</p>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Один участник может состоять только в одной команде.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Если вы уже в команде, приглашения в другие команды будут
                  недоступны.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Капитан должен подтвердить ваш запрос, чтобы вы попали в
                  команду.
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: отвечайте на приглашения быстро — команды часто
                заполняются в первые часы.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Правила участия</h2>
              <h3 className={styles.cardSubtitle}>
                Ключевые правила, которые помогут избежать путаницы:
              </h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Один участник — одна команда в рамках одного хакатона.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Нельзя отправить приглашение участнику, уже состоящему в
                  команде.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Команда должна иметь капитана.
                </p>
              </div>
              <div className={styles.step}>
                <span className={styles.bullet}>●</span>
                <p className={styles.stepText}>
                  Участник может в любой момент выйти из команды (кроме
                  финального этапа формирования).
                </p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>
                <img src={noteIcon} alt="note-icon" />
              </span>
              <p className={styles.tipText}>
                Совет: согласовывайте решения внутри команды заранее, чтобы не
                нарушать лимиты и правила.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
