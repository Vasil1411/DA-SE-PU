let currentTeamId = null;
let currentPage = 1;
const pageSize = 2; 
let currentSearch = '';

let allTeamPosts = [];       
let currentPostPage = 1;     
const postPageSize = 2;      
let currentPostSearch = '';  
let currentPostIdToEdit = null;
let currentCommentIdToEdit = null;

// Функция, която се изпълнява автоматично при зареждане на страницата, за да зареди отборите и да провери дали сме логнати.
window.onload = () => {
    loadTeams(); 
    checkLoginState();
};

// Функция, която проверява дали има записан токен и показва бутона "Изход" или формата за логин.
function checkLoginState() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('auth-buttons');
    
    if (token) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('admin-actions').classList.remove('hidden');
        authButtons.innerHTML = `<button onclick="logout()" style="background-color: #6c757d; width: auto;">Изход</button>`;
    } else {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('admin-actions').classList.add('hidden');
        authButtons.innerHTML = '';
    }
}

// Функция, която скрива формата за вход и показва формата за регистрация на нов потребител.
function showRegister() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
}

// Функция, която скрива формата за регистрация и показва формата за вход (логин).
function showLogin() {
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
}

// Функция, която изпраща данните от формата за регистрация към бекенда чрез POST заявка.
async function register() {
    const data = {
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Успешна регистрация!");
            showLogin();
        } else {
            alert("Грешка при регистрация: " + await res.text());
        }
    } catch (e) {
        alert("Сървърът не отговаря!");
    }
}

// Функция за вход в системата, която изпраща потребителското име и паролата и записва получения JWT токен в браузъра.
async function login() {
    const data = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const result = await res.json();
            localStorage.setItem('token', result.token);
            alert("Успешен вход!");
            checkLoginState();
            loadTeams();
        } else {
            alert("Грешно потребителско име или парола!");
        }
    } catch (e) {
        alert("Сървърът не отговаря!");
    }
}

// Функция, която изтрива JWT токена от браузъра и презарежда страницата, за да отпише потребителя.
function logout() {
    localStorage.removeItem('token');
    location.reload();
}

// Функция, която извлича списъка с отбори от сървъра (със сървърна пагинация и филтриране) и ги рендира на екрана.
async function loadTeams() {
    try {
        let url = `/api/teams?PageNumber=${currentPage}&PageSize=${pageSize}`;
        if (currentSearch) {
            url += `&searchTerm=${encodeURIComponent(currentSearch)}`;
        }

        const res = await fetch(url, { method: 'GET' });

        if (res.ok) {
            const result = await res.json(); 
            const list = document.getElementById('teams-list');
            list.innerHTML = ''; 

            if (!result.items || result.items.length === 0) {
                list.innerHTML = '<p>Няма намерени отбори.</p>';
                document.getElementById('page-info').innerText = `Страница ${currentPage}`;
                document.getElementById('btn-next').disabled = true;
                document.getElementById('btn-prev').disabled = currentPage === 1;
                return;
            }

            result.items.forEach(team => {
                const div = document.createElement('div');
                div.className = 'team-card';
                div.innerHTML = `
                    <h3>${team.name}</h3>
                    <p>Държава: ${team.country}</p>
                `;
                div.onclick = () => showDetails(team.teamId);
                list.appendChild(div);
            });

            const totalPages = result.totalPages || Math.ceil(result.totalCount / pageSize);
            document.getElementById('page-info').innerText = `Страница ${currentPage} от ${totalPages}`;
            
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = currentPage >= totalPages;
        }
    } catch (e) {
        console.error("Грешка при зареждане на отборите:", e);
    }
}

// Функция, която взима текста от полето за търсене на отбори, нулира страницата на 1 и вика функцията за зареждане.
function triggerSearch() {
    const inputElement = document.getElementById('search-input'); 
    currentSearch = inputElement.value; 
    currentPage = 1; 
    loadTeams();
    
    inputElement.value = ''; 
}

// Функция за смяна на страниците на отборите напред или назад чрез бутоните за пагинация.
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    loadTeams();
}

// Функция, която отваря детайлния преглед на конкретен отбор и показва бутони за редакция/триене само ако логнатият е създател.
async function showDetails(id) {
    try {
        const res = await fetch(`/api/teams/${id}`, { method: 'GET' });
        if (!res.ok) return alert("Отборът не е намерен.");

        const team = await res.json();
        currentTeamId = id;

        const creatorName = team.creatorName || team.CreatorName || "Неизвестен";

        document.getElementById('view-name').innerText = team.name;
        document.getElementById('view-country').innerText = team.country;
        document.getElementById('view-creator').innerText = creatorName;

        const currentLoggedInUser = getUsernameFromToken();

        if (currentLoggedInUser && creatorName !== "Неизвестен" && currentLoggedInUser.toLowerCase() === creatorName.toLowerCase()) {
            document.getElementById('team-management-buttons').classList.remove('hidden');
        } else {
            document.getElementById('team-management-buttons').classList.add('hidden');
        }

        document.getElementById('main-section').classList.add('hidden');
        document.getElementById('edit-form').classList.add('hidden');
        document.getElementById('details-section').classList.remove('hidden');
        
        loadPostsForTeam(id); 
        
    } catch (e) {
        console.error(e);
    }
}

// Функция, която затваря прозореца с детайлите за отбора и ни връща към главния списък с всички отбори.
function closeDetails() {
    document.getElementById('details-section').classList.add('hidden');
    document.getElementById('main-section').classList.remove('hidden');
    cancelPostEdit(); 
    currentTeamId = null;
}

// Функция, която изпраща POST заявка с име и държава към бекенда, за да създаде нов отбор в базата данни.
async function createTeam() {
    const data = {
        name: document.getElementById('create-team-name').value,
        country: document.getElementById('create-team-country').value
    };

    if (!data.name || !data.country) return alert("Моля попълнете всички полета!");

    try {
        const res = await fetch('/api/teams', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Отборът е създаден успешно!");
            document.getElementById('create-team-name').value = '';
            document.getElementById('create-team-country').value = '';
            loadTeams();
        } else {
            alert("Неуспешно създаване!");
        }
    } catch (e) {
        alert("Грешка при връзка със сървъра.");
    }
}

// Функция, която показва формата за редактиране на отбор и попълва вътре текущите му име и държава.
function showEditForm() {
    document.getElementById('edit-form').classList.remove('hidden');
    document.getElementById('edit-team-name').value = document.getElementById('view-name').innerText;
    document.getElementById('edit-team-country').value = document.getElementById('view-country').innerText;
}

// Функция, която изпраща PUT заявка към сървъра, за да запази новите (редактирани) данни на текущия отбор.
async function saveEdit() {
    const data = { 
        name: document.getElementById('edit-team-name').value, 
        country: document.getElementById('edit-team-country').value 
    };

    try {
        const res = await fetch(`/api/teams/${currentTeamId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Отборът е обновен!");
            closeDetails();
            loadTeams();
        } else if (res.status === 403) {
            alert("Нямаш права да редактираш този отбор! Само създателят му може.");
        } else {
            alert("Грешка при редакция.");
        }
    } catch (e) {
        alert("Грешка при връзка.");
    }
}

// Функция, която изпраща DELETE заявка към сървъра, за да изтрие избрания отбор по неговото ID.
async function deleteTeam() {
    if (!confirm("Сигурен ли си, че искаш да изтриеш този отбор?")) return;
    
    try {
        const res = await fetch(`/api/teams/${currentTeamId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            alert("Отборът е изтрит!");
            closeDetails();
            loadTeams();
        } else if (res.status === 403) {
            alert("Нямаш права да изтриеш този отбор!");
        } else {
            alert("Грешка при изтриване.");
        }
    } catch (e) {
        alert("Грешка при връзка.");
    }
}

// Функция, която сваля абсолютно всички публикации за даден отбор от сървъра и ги записва в локалния масив allTeamPosts.
async function loadPostsForTeam(teamId) {
    if (!teamId) return;
    currentTeamId = teamId;

    try {
        const res = await fetch(`/api/posts/team/${teamId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!res.ok) {
            throw new Error(`Грешка при зареждане на постовете: ${res.status}`);
        }

        const data = await res.json();
        
        // 1. Записваме новите данни в глобалната променлива
        allTeamPosts = data; 
        
        // 2. Слагаме малко закъснение или директно рендерираме, за да сме сигурни, че UI ще се обнови
        renderPosts();

    } catch (e) {
        console.error("Грешка в loadPostsForTeam:", e);
        alert("Неуспешно обновяване на публикациите. Проверете конзолата (F12).");
    }
}

// Функция, която извършва клиентско филтриране, клиентска пагинация и генерира HTML кода за показване на публикациите, лайковете и техните коментари.
function renderPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    let filteredPosts = allTeamPosts;
    if (currentPostSearch) {
        filteredPosts = allTeamPosts.filter(post => {
            const content = post.content || post.Content || '';
            const author = post.authorName || post.AuthorName || '';
            return content.toLowerCase().includes(currentPostSearch.toLowerCase()) ||
                   author.toLowerCase().includes(currentPostSearch.toLowerCase());
        });
    }

    if (filteredPosts.length === 0) {
        postsList.innerHTML = '<p style="color: #666; font-style: italic;">Няма намерени публикации.</p>';
        document.getElementById('post-page-info').innerText = "Страница 1 от 1";
        document.getElementById('btn-post-prev').disabled = true;
        document.getElementById('btn-post-next').disabled = true;
        return;
    }

    const totalPages = Math.ceil(filteredPosts.length / postPageSize);
    if (currentPostPage > totalPages) currentPostPage = totalPages;
    if (currentPostPage < 1) currentPostPage = 1;

    const startIndex = (currentPostPage - 1) * postPageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postPageSize);

    const currentLoggedInUser = getUsernameFromToken();

    paginatedPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.style = "background: white; border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);";
        
        let managementHtml = '';
        let likeSectionHtml = '';

        const postId = post.postId || post.PostId;
        const postContent = post.content || post.Content || '';
        const postAuthorName = post.authorName || post.AuthorName || 'Анонимен';
        const postCreatedAt = post.createdAt || post.CreatedAt;

        const initialLikes = post.likesCount !== undefined ? post.likesCount : (post.LikesCount || 0);
        const isAlreadyLiked = post.isLikedByCurrentUser === true || post.IsLikedByCurrentUser === true;

        // Рендиране на бутони за управление (Редактирай/Изтрий)
        if (currentLoggedInUser && postAuthorName && currentLoggedInUser.toLowerCase() === postAuthorName.toLowerCase()) {
            managementHtml = `
                <div style="display: flex; gap: 10px;">
                    <button onclick="initiatePostEdit(${postId}, \`${postContent.replace(/`/g, '\\`').replace(/\n/g, ' ')}\`)" style="width: auto; padding: 3px 10px; font-size: 12px; background-color: #ffc107; color: black;">Редактирай</button>
                    <button onclick="deletePost(${postId})" style="width: auto; padding: 3px 10px; font-size: 12px; background-color: #dc3545; color: white;">Изтрий</button>
                </div>
            `;
        }

        // Рендиране на секция за лайкове
        if (localStorage.getItem('token')) {
            likeSectionHtml = `
                <div class="like-container" style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-size: 13px; color: #555;">Лайкове: <strong class="like-counter">${initialLikes}</strong></span>
                    <button class="btn-like-action" onclick="executeLikeAction(${postId}, this, 'like')" 
                            style="width: auto; padding: 5px 12px; font-size: 12px; background-color: #007bff; border-radius: 4px; 
                            display: ${isAlreadyLiked ? 'none' : 'inline-block'};">👍 Харесай</button>
                    <button class="btn-unlike-action" onclick="executeLikeAction(${postId}, this, 'unlike')" 
                            style="width: auto; padding: 5px 12px; font-size: 12px; background-color: #dc3545; border-radius: 4px; 
                            display: ${isAlreadyLiked ? 'inline-block' : 'none'};">👎 Махни лайк</button>
                </div>
            `;
        } else {
            likeSectionHtml = `<span style="font-size: 13px; color: #666;">👍 Харесвания: <strong>${initialLikes}</strong></span>`;
        }

        // Подготовка на коментарите чрез външната функция
        const commentsList = post.comments || post.Comments || post.commentResponseDtos || post.CommentResponseDtos || [];
        const commentsHtml = generateCommentsSection(post, postId, commentsList, currentLoggedInUser);

        const date = new Date(postCreatedAt).toLocaleString('bg-BG');

        postDiv.innerHTML = `
            <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.4; white-space: pre-line;">${postContent}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
                <span style="font-size: 12px; color: #555;">✍ Автор: <strong>${postAuthorName}</strong></span>
                <span style="font-size: 11px; color: #999;">${date}</span>
            </div>
            <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                ${likeSectionHtml}
                ${managementHtml}
            </div>
            ${commentsHtml}
        `;
        postsList.appendChild(postDiv);
    });

    document.getElementById('post-page-info').innerText = `Страница ${currentPostPage} от ${totalPages}`;
    document.getElementById('btn-post-prev').disabled = currentPostPage === 1;
    document.getElementById('btn-post-next').disabled = currentPostPage >= totalPages;
}

// Функция, която филтрира публикациите по въведения в търсачката текст и рестартира пагинацията им от първа страница.
function triggerPostSearch() {
    const inputElement = document.getElementById('post-search-input'); 
    currentPostSearch = inputElement.value; 
    currentPostPage = 1; 
    renderPosts();
    
    inputElement.value = ''; 
}

// Функция за прелистване на страниците на публикациите (напред или назад) чрез бутоните за пагинация.
function changePostPage(direction) {
    currentPostPage += direction;
    renderPosts();
}

// Функция, която изпраща POST заявка с текст към бекенда, за да създаде нова публикация (пост) към текущия отбор.
async function createPost() {
    const contentInput = document.getElementById('post-content-input');
    const data = { content: contentInput.value };

    if (!data.content || data.content.length < 10) {
        return alert("Публикацията трябва да съдържа поне 10 символа!");
    }

    try {
        const res = await fetch(`/api/posts/create/${currentTeamId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            contentInput.value = '';
            alert("Публикацията е добавена!");
            loadPostsForTeam(currentTeamId); 
        } else {
            alert("Грешка при създаване на публикация.");
        }
    } catch (e) {
        alert("Сървърът не отговаря.");
    }
}

// Функция, която отваря малкото прозорче за редакция на конкретна публикация и вкарва стария й текст вътре.
function initiatePostEdit(postId, content) {
    currentPostIdToEdit = postId;
    document.getElementById('post-edit-container').classList.remove('hidden');
    document.getElementById('post-edit-input').value = content;
    document.getElementById('post-edit-container').scrollIntoView({ behavior: 'smooth' });
}

// Функция, която затваря и изчиства прозорчето за редактиране на публикация, ако се откажем.
function cancelPostEdit() {
    currentPostIdToEdit = null;
    document.getElementById('post-edit-container').classList.add('hidden');
    document.getElementById('post-edit-input').value = '';
}

// Функция, която изпраща PUT заявка с новия текст към сървъра, за да обнови съдържанието на редактираната публикация.
    async function savePostEdit() {
    const updatedContent = document.getElementById('post-edit-input').value;

    if (!updatedContent || updatedContent.length < 10) {
        return alert("Публикацията трябва да е поне 10 символа!");
    }

    try {
        const res = await fetch(`/api/posts/${currentPostIdToEdit}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: updatedContent })
        });

        if (res.ok) {
            alert("Публикацията е обновена успешно!");
            cancelPostEdit();
            const postIndex = allTeamPosts.findIndex(p => p.postId === currentPostIdToEdit);
            if (postIndex !== -1) {
                allTeamPosts[postIndex].content = updatedContent;
            }
            renderPosts();
        } else {
            alert("Не можеш да редактираш тази публикация! (Само собственикът има право)");
        }
    } catch (e) {
        alert("Грешка при изпращане.");
    }
}

// Функция, която изпраща DELETE заявка към бекенда, за да изтрие публикация по нейното ID.
async function deletePost(postId) {
    if (!confirm("Сигурен ли си, че искаш да изтриеш тази публикация?")) return;

    try {
        const res = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            alert("Публикацията е изтрита.");
            allTeamPosts = allTeamPosts.filter(p => p.postId !== postId);
            renderPosts();
        } else {
            alert("Нямаш право да изтриеш тази публикация! (Не си неин автор)");
        }
    } catch (e) {
        alert("Грешка при комуникация със сървъра.");
    }
}

// Функция, която обработва харесването или премахването на лайк, праща заявка до API-то и променя брояча визуално на екрана.
async function executeLikeAction(postId, clickedButton, actionType) {
    // actionType е 'like' или 'unlike'
    
    try {
        const res = await fetch(`/api/likes/${actionType}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json' // ТОВА Е ВАЖНО
            },
            // Тук изпращаме PostId в тялото, за да съвпадне с LikeRequestDto
            body: JSON.stringify({ postId: postId }) 
        });

        const result = await res.json(); 

        if (res.ok) {
            // Успех - презареждаме или обновяваме UI
            alert(result.message);
            location.reload(); 
        } else {
            // Показваме съобщението от LikeResponseDto
            alert("Грешка: " + result.message);
        }
    } catch (e) {
        alert("Възникна мрежова грешка.");
        console.error(e);
    }
}

/// --- КОРЕКТИРАНИ ФУНКЦИИ ЗА КОМЕНТАРИ (СЪОБРАЗЕНИ С БЕКЕНДА) ---

async function createComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) {
        console.error("Не е намерен вход за коментар за пост:", postId);
        return;
    }
    
    const commentText = input.value.trim();
    if (!commentText) return alert("Напиши нещо!");

    try {
        const res = await fetch(`/api/comments/create/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            // Тук изпращаме 'content' с малка буква, което трябва да съвпадне с DTO-то
            body: JSON.stringify({ content: commentText }) 
        });

        if (res.ok) {
            alert("Успешно!");
            input.value = '';
            loadPostsForTeam(currentTeamId);
        } else {
            const err = await res.text();
            console.error("Грешка от сървъра:", err);
            alert("Грешка: " + err);
        }
    } catch (e) {
        alert("Грешка при връзка!");
    }
}

function initiateCommentEdit(postId, commentId, currentContent) {
    currentCommentIdToEdit = commentId;
    
    const displayDiv = document.getElementById(`comment-display-${commentId}`);
    if (displayDiv) displayDiv.classList.add('hidden');
    
    const editForm = document.getElementById(`comment-edit-box-${commentId}`);
    if (editForm) editForm.classList.remove('hidden');
    
    const editInput = document.getElementById(`comment-edit-input-${commentId}`);
    if (editInput) editInput.value = currentContent;
}

function cancelCommentEdit(commentId) {
    currentCommentIdToEdit = null;
    
    const displayDiv = document.getElementById(`comment-display-${commentId}`);
    if (displayDiv) displayDiv.classList.remove('hidden');
    
    const editForm = document.getElementById(`comment-edit-box-${commentId}`);
    if (editForm) editForm.classList.add('hidden');
}

async function saveCommentEdit(commentId) {
    const inputEl = document.getElementById(`comment-edit-input-${commentId}`);
    if (!inputEl) return;
    
    const updatedContent = inputEl.value.trim();

    if (!updatedContent || updatedContent.length < 5) {
        return alert("Коментарът трябва да съдържа поне 5 символа!");
    }

    try {
        const res = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
           body: JSON.stringify({ content: updatedContent }) 
        });

        if (res.ok) {
            alert("Коментарът е обновен успешно!");
            currentCommentIdToEdit = null;
            loadPostsForTeam(currentTeamId);
        } else {
            const errorText = await res.text();
            alert("Грешка при редакция: " + errorText);
        }
    } catch (e) {
        alert("Грешка при изпращане на данните.");
    }
}

async function deleteComment(commentId) {
    if (!confirm("Сигурен ли си, че искаш да изтриеш този коментар?")) return;

    try {
        const res = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            alert("Коментарът е изтрит.");
            loadPostsForTeam(currentTeamId);
        } else {
            const errorText = await res.text();
            alert("Грешка при изтриване: " + errorText);
        }
    } catch (e) {
        alert("Грешка при връзка със сървъра.");
    }
}

function getUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.unique_name || payload.name;
    } catch (e) {
        return null;
    }
}



document.addEventListener('click', function(e) {
    // 1. Коментари
    if (e.target.classList.contains('btn-send-comment')) {
        const postId = e.target.getAttribute('data-post-id');
        createComment(postId);
    }
});

function generateCommentsSection(post, postId, commentsList, currentLoggedInUser) {
    let commentItemsHtml = '';

    commentsList.forEach(comment => {
        const commentDate = new Date(comment.createdAt || comment.CreatedAt).toLocaleString('bg-BG');
        const commentAuthor = comment.authorName || comment.AuthorName || "Анонимен";
        const commentId = comment.commentId || comment.CommentId;
        const commentContent = comment.content || comment.Content || '';

        let commentManagementHtml = '';
        if (currentLoggedInUser && commentAuthor.toLowerCase() === currentLoggedInUser.toLowerCase()) {
            commentManagementHtml = `
                <div style="font-size: 11px; margin-top: 5px; display: flex; gap: 8px;">
                    <a href="javascript:void(0)" onclick="initiateCommentEdit(${postId}, ${commentId}, \`${commentContent.replace(/`/g, '\\`').replace(/\n/g, ' ')}\`)" style="color: #ffc107; text-decoration: none; font-weight: bold;">Редактирай</a>
                    <a href="javascript:void(0)" onclick="deleteComment(${commentId})" style="color: #dc3545; text-decoration: none; font-weight: bold;">Изтрий</a>
                </div>
            `;
        }

        commentItemsHtml += `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-top: 8px; border-radius: 6px;">
                <div id="comment-display-${commentId}">
                    <p style="margin: 0; font-size: 14px; color: #334155;">${commentContent}</p>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 4px;">
                        <span>💬 от <strong>${commentAuthor}</strong></span>
                        <span>${commentDate}</span>
                    </div>
                    ${commentManagementHtml}
                </div>
                <div id="comment-box-editor-${commentId}">
                    <div id="comment-edit-box-${commentId}" class="hidden" style="margin-top: 5px;">
                        <input type="text" id="comment-edit-input-${commentId}" style="font-size: 13px; padding: 5px;" />
                        <div style="margin-top: 5px; display: flex; gap: 5px;">
                            <button onclick="saveCommentEdit(${commentId})" style="padding: 2px 8px; font-size: 11px; background-color: #28a745; color: white; width: auto;">Запази</button>
                            <button onclick="cancelCommentEdit(${commentId})" style="padding: 2px 8px; font-size: 11px; background-color: #6c757d; color: white; width: auto;">Отказ</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    let createCommentFormHtml = '';
    if (localStorage.getItem('token')) {
        createCommentFormHtml = `
            <div style="margin-top: 12px; border-top: 1px dashed #e2e8f0; padding-top: 8px; display: flex; gap: 8px;">
                <input type="text" id="comment-input-${postId}" placeholder="Напиши коментар..." style="margin: 0; padding: 6px 10px; font-size: 13px;" />
                <button class="btn-send-comment" data-post-id="${postId}" style="width: auto; padding: 6px 12px; font-size: 13px; background-color: #2c3e50; color: white;">Изпрати</button>
            </div>
        `;
    }

    return `
        <div style="margin-top: 15px; background: #fafafa; border-radius: 6px; padding: 10px; border-top: 2px solid #e2e8f0;">
            <h4 style="margin: 0 0 5px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Коментари (${commentsList.length})</h4>
            <div id="comments-container-${postId}">
                ${commentItemsHtml || '<p style="font-size: 12px; color: #94a3b8; font-style: italic; margin: 5px 0 0 0;">Все още няма коментари към тази публикация.</p>'}
            </div>
            ${createCommentFormHtml}
        </div>
    `;
}


