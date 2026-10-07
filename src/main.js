const SAVE_KEY = 'rainbow-ranch-save';
const ITEMS = {
  egg: { name: '新鲜鸡蛋', icon: '🥚' }, milk: { name: '香浓牛奶', icon: '🥛' }, carrot: { name: '胡萝卜', icon: '🥕' }, tomato: { name: '番茄', icon: '🍅' }, corn: { name: '甜玉米', icon: '🌽' }, pumpkin: { name: '南瓜', icon: '🎃' }, lettuce: { name: '生菜', icon: '🥬' }, strawberry: { name: '草莓', icon: '🍓' }, strawberryMilk: { name: '草莓牛奶', icon: '🍓🥛' }, salad: { name: '番茄沙拉', icon: '🥗' }, pumpkinPie: { name: '南瓜派', icon: '🥧' }, soup: { name: '玉米浓汤', icon: '🍲' }, sandwich: { name: '蔬菜三明治', icon: '🥪' }, flower: { name: '彩虹花种', icon: '🌼' }, seed: { name: '蔬菜种子', icon: '🌱' }, bell: { name: '星星牛铃', icon: '🔔' }, hat: { name: '彩虹草帽', icon: '👒' }, pinwheel: { name: '小风车', icon: '🎐' }, pond: { name: '小池塘装饰', icon: '🪷' }, scarf: { name: '彩虹围巾', icon: '🧣' }, hay: { name: '香香干草', icon: '🌾' }
};
const recipes = [
  { id: 'strawberryMilk', name: '草莓牛奶', icon: '🍓🥛', needs: { milk: 1, strawberry: 1 } },
  { id: 'salad', name: '番茄沙拉', icon: '🥗', needs: { tomato: 1, lettuce: 1 } },
  { id: 'pumpkinPie', name: '南瓜派', icon: '🥧', needs: { pumpkin: 1, egg: 1 } },
  { id: 'soup', name: '玉米浓汤', icon: '🍲', needs: { corn: 1, milk: 1 } },
  { id: 'sandwich', name: '蔬菜三明治', icon: '🥪', needs: { lettuce: 1, tomato: 1, corn: 1 } }
];
const shopItems = [
  { id: 'seed', name: '神奇蔬菜种子', icon: '🌱', price: 3, desc: '菜地播种的好帮手' },
  { id: 'hay', name: '香香干草', icon: '🌾', price: 5, desc: '给动物朋友添点美味' },
  { id: 'flower', name: '彩虹花种', icon: '🌼', price: 8, desc: '让牧场开满漂亮小花' },
  { id: 'bell', name: '星星牛铃', icon: '🔔', price: 12, desc: '叮当响的牧场新装饰' },
  { id: 'hat', name: '彩虹草帽', icon: '👒', price: 15, desc: '戴上它，去田野探险' },
  { id: 'pinwheel', name: '会转的小风车', icon: '🎐', price: 10, desc: '微风一吹就快乐转圈' }
];
const orders = [
  { customer: '小米和妈妈', request: '一杯草莓牛奶', icon: '🍓🥛', needs: { strawberryMilk: 1 }, coins: 8, stars: 2 },
  { customer: '旅行小兔', request: '一颗新鲜鸡蛋', icon: '🥚', needs: { egg: 1 }, coins: 5, stars: 1 },
  { customer: '花园厨师', request: '一碗玉米浓汤', icon: '🍲', needs: { soup: 1 }, coins: 10, stars: 2 },
  { customer: '野餐小伙伴', request: '一份番茄沙拉', icon: '🥗', needs: { salad: 1 }, coins: 8, stars: 2 }
];
const initial = { version: 1, character: 'girl', coins: 20, stars: 3, inventory: { seed: 6, egg: 0, milk: 0, carrot: 0, tomato: 0, corn: 0, pumpkin: 0, lettuce: 0, strawberry: 0 }, plots: Array(6).fill(null), harvests: 0, animals: { chicken: 0, cow: 0, pet: 0 }, owned: [], order: 0, ordersDone: 0, day: 1, weather: 0, sound: true, selectedPlot: null };
function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!parsed || parsed.version !== 1) return structuredClone(initial);
    return { ...structuredClone(initial), ...parsed, inventory: { ...initial.inventory, ...parsed.inventory }, plots: Array.isArray(parsed.plots) && parsed.plots.length === 6 ? parsed.plots : Array(6).fill(null) };
  } catch { return structuredClone(initial); }
}
let state = loadSave();
let toastTimer;
let audioContext;
const $ = (id) => document.getElementById(id);
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {} };
const count = (id) => state.inventory[id] || 0;
function addItem(id, amount = 1) { state.inventory[id] = count(id) + amount; }
function removeItems(needs) { for (const [key, amount] of Object.entries(needs)) { if (count(key) < amount) return false; } for (const [key, amount] of Object.entries(needs)) state.inventory[key] -= amount; return true; }
function notify(message, sound = 'pop') { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); if (state.sound) playSound(sound); }
function playSound(kind = 'pop') { try { audioContext ||= new AudioContext(); const ctx = audioContext; const notes = kind === 'reward' ? [660, 880, 1100] : kind === 'collect' ? [700, 960] : [560]; notes.forEach((freq, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(.001, ctx.currentTime + i * .09); g.gain.exponentialRampToValueAtTime(.07, ctx.currentTime + i * .09 + .018); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + i * .09 + .18); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + i * .09); o.stop(ctx.currentTime + i * .09 + .2); }); } catch {} }
function updateHUD() { $('coins').textContent = state.coins; $('stars').textContent = state.stars; $('shopCoins').textContent = state.coins; $('coopEggs').textContent = count('egg'); $('seedCount').textContent = count('seed'); $('orderBadge').textContent = state.ordersDone ? '✓' : '1'; $('weatherIcon').textContent = ['☀️', '☁️', '🌧️'][state.weather % 3]; $('weatherText').textContent = `${['晴朗', '多云', '小雨'][state.weather % 3]} · ${['白天', '傍晚', '夜晚'][Math.floor((state.day - 1) % 3)]}`; $('greeting').textContent = state.ordersDone ? '你好呀，彩虹牧场小主人！' : '早上好，农场小主人！'; $('player').textContent = state.character === 'boy' ? '🧑🏻‍🌾' : '👩🏻‍🌾'; renderGarden(); renderRecipes(); renderShop(); }
function switchScene(name) { document.querySelectorAll('.scene').forEach(s => s.classList.toggle('active', s.id === `scene-${name}`)); document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.scene === name)); if (name === 'coop') { $('player').classList.add('visually-hidden'); } else { $('player').classList.remove('visually-hidden'); } }
function modal(title, content) { $('modal').innerHTML = `<div class="modal-head"><h2>${title}</h2><button class="close-modal" data-action="closeModal" aria-label="关闭">✕</button></div>${content}`; $('modalBackdrop').classList.add('open'); }
function closeModal() { $('modalBackdrop').classList.remove('open'); }
function renderGarden() { const grid = $('gardenGrid'); if (!grid) return; grid.innerHTML = state.plots.map((plot, i) => { if (!plot) return `<button class="garden-tile" data-action="selectPlot" data-index="${i}" aria-label="空地，点击播种">＋<small>空地</small></button>`; const icons = ['🌱', '🌿', '🌼', plot.crop === 'pumpkin' ? '🎃' : plot.crop === 'tomato' ? '🍅' : plot.crop === 'corn' ? '🌽' : plot.crop === 'lettuce' ? '🥬' : '🥕']; const stage = Math.min(3, Math.floor((Date.now() - plot.plantedAt) / 45000)); const ready = stage >= 3; return `<button class="garden-tile ${ready ? 'ready' : ''}" data-action="selectPlot" data-index="${i}" aria-label="${ready ? '成熟的' : '成长中的'}${ITEMS[plot.crop]?.name || '作物'}">${icons[stage]}<small>${ready ? '可以收获啦！' : `成长中 ${stage + 1}/4`}</small></button>`; }).join(''); }
function renderRecipes() { const root = $('recipes'); if (!root) return; root.innerHTML = recipes.map(recipe => { const ready = Object.entries(recipe.needs).every(([id, n]) => count(id) >= n); const ingredients = Object.entries(recipe.needs).map(([id, n]) => `${ITEMS[id].icon}${n > 1 ? `×${n}` : ''}`).join(' '); return `<article class="recipe-card"><div class="recipe-emoji">${recipe.icon}</div><strong>${recipe.name}</strong><p>${ingredients}</p><button data-action="cook" data-item="${recipe.id}" ${ready ? '' : 'disabled'}>${ready ? '开始烹饪' : '食材还不够'}</button></article>`; }).join(''); }
function renderShop() { const root = $('shopGrid'); if (!root) return; root.innerHTML = shopItems.map(item => { const owned = state.owned.includes(item.id); return `<article class="shop-card"><div class="item-icon">${item.icon}</div><h3>${item.name}</h3><p>${item.desc}</p><button data-action="buy" data-item="${item.id}" ${owned || state.coins < item.price ? 'disabled' : ''}>${owned ? '已经拥有啦 ✓' : `🪙 ${item.price} · 带回家`}</button></article>`; }).join(''); }
function renderBag() { const entries = Object.entries(state.inventory).filter(([, amount]) => amount > 0); modal('🎒 小小背包', `<p class="modal-copy">这是你辛勤劳动收集的宝贝！</p><div class="inventory-list">${entries.length ? entries.map(([id, amount]) => `<div class="inventory-item"><span>${ITEMS[id]?.icon || '✨'}</span>${ITEMS[id]?.name || id}<br><b>× ${amount}</b></div>`).join('') : '<p class="modal-copy">背包轻轻的，去牧场发现好东西吧！</p>'}</div><div class="modal-actions"><button data-action="scene" data-scene="garden">🌱 去菜地</button><button data-action="scene" data-scene="kitchen">🍳 去厨房</button></div>`); }
function showOrder() { const order = orders[state.order % orders.length]; const ready = Object.entries(order.needs).every(([id, n]) => count(id) >= n); modal('📜 彩虹小订单', `<div class="order-card"><div class="order-art">${order.icon}</div><h3>${order.customer}想要${order.request}</h3><p class="modal-copy">完成后可以获得 🪙 ${order.coins} 和 ⭐ ${order.stars}，一起帮助朋友吧！</p></div><div class="modal-actions"><button data-action="deliver" ${ready ? '' : 'disabled'}>${ready ? '🎁 把礼物送给朋友' : '🔎 背包里的食材还不够'}</button><button data-action="closeModal">一会儿再来</button></div>`); }
function interactAnimal(name = '动物朋友') { modal(`🐾 ${name}`, `<div class="order-card"><div class="order-art">${name === '棉棉' ? '🐑' : name === '花花' ? '🐄' : '🐔'}</div><h3>${name}看见你啦！</h3><p class="modal-copy">它的眼睛亮晶晶的，正在等你来照顾它。</p></div><div class="modal-actions"><button data-action="pet">💗 轻轻摸摸</button><button data-action="feed">🌽 送它一把玉米</button>${name === '花花' ? '<button data-action="milk">🥛 帮花花挤奶</button>' : ''}<button data-action="closeModal">挥挥手</button></div>`); }
function collectEgg() { const egg = document.querySelector('.egg:not(.collected)'); if (!egg) { if (count('egg') >= 3) return notify('鸡舍里的鸡蛋都收进篮子啦！', 'pop'); return notify('小鸡还在准备惊喜，摸摸它们吧！'); } egg.classList.add('collected'); egg.style.opacity = '0'; egg.style.pointerEvents = 'none'; addItem('egg'); state.coins += 1; notify('🥚 捡到一颗新鲜鸡蛋！ +1 金币', 'collect'); updateHUD(); save(); }
function layEgg(button) { if (document.querySelectorAll('.egg:not(.collected)').length >= 3) return notify('鸡蛋已经香喷喷地躺在干草上啦！'); const floor = document.querySelector('.coop-floor'); const e = document.createElement('button'); e.className = 'egg'; e.dataset.action = 'collectEgg'; e.textContent = '🥚'; e.style.left = `${18 + Math.random() * 65}%`; e.style.top = `${32 + Math.random() * 48}%`; floor.append(e); button.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 550 }); notify('咯咯！小鸡下了一颗蛋！', 'collect'); }
function plantAt(index) { const plot = state.plots[index]; if (plot) { if (Date.now() - plot.plantedAt >= 135000) { addItem(plot.crop); state.plots[index] = null; state.harvests++; state.coins += 2; state.stars += 1; notify(`收获了${ITEMS[plot.crop].name}！⭐ +1`, 'reward'); } else { const remaining = Math.ceil((135000 - (Date.now() - plot.plantedAt)) / 1000); notify(`小苗正在长大，再过一会儿就能收获啦！`); } } else if (count('seed') > 0) { state.plots[index] = { crop: ['carrot', 'tomato', 'corn', 'pumpkin', 'lettuce', 'strawberry'][Math.floor(Math.random() * 6)], plantedAt: Date.now() }; state.inventory.seed--; notify('🌱 播下一颗种子，期待它长大吧！', 'collect'); } else { notify('没有种子啦，去商店带一些回来吧！'); }
  updateHUD(); save(); }
function plant() { const index = state.plots.findIndex(p => !p); if (index < 0) return notify('每块小土地都有小苗住着呢！'); plantAt(index); }
function harvest() { const ripe = state.plots.findIndex(p => p && Date.now() - p.plantedAt >= 135000); if (ripe < 0) return notify('小苗正在努力长大，等一等就有收获啦！'); plantAt(ripe); }
function cook(id) { const recipe = recipes.find(r => r.id === id); if (!recipe || !removeItems(recipe.needs)) return notify('再去菜地找找食材吧！'); addItem(id); notify(`${recipe.icon} ${recipe.name}做好啦！放进了背包。`, 'reward'); updateHUD(); save(); }
function buy(id) { const item = shopItems.find(i => i.id === id); if (!item || state.owned.includes(id) || state.coins < item.price) return notify('再多收集一些金币，就可以买到啦！'); state.coins -= item.price; state.owned.push(id); if (id === 'seed') addItem('seed', 4); else if (id === 'hay') { addItem('corn', 1); } notify(`✨ ${item.name}已经放进背包啦！`, 'reward'); updateHUD(); save(); }
function deliver() { const order = orders[state.order % orders.length]; if (!removeItems(order.needs)) return notify('还没有准备好礼物，再去找找吧！'); state.coins += order.coins; state.stars += order.stars; state.order++; state.ordersDone++; save(); updateHUD(); modal('🎉 朋友收到礼物啦！', `<div class="order-card"><div class="order-art">💖 🎉 💖</div><h3>${order.customer}开心地说：谢谢你！</h3><p class="modal-copy">你的爱心让牧场更温暖！<br>🪙 +${order.coins} 金币　 ⭐ +${order.stars} 彩虹星</p></div><div class="modal-actions"><button data-action="closeModal">太棒啦！</button><button data-action="orders">看看新订单</button></div>`); playSound('reward'); }
function milk() { if (state.animals.cow >= 2) return notify('今天的牛奶都挤好啦，花花需要休息一会儿。'); state.animals.cow++; addItem('milk', 1); notify('🥛 接好了一杯香浓牛奶！', 'reward'); updateHUD(); save(); }
function handle(action, el) { const item = el.dataset.item; switch (action) {
  case 'scene': closeModal(); switchScene(el.dataset.scene); break;
  case 'collectEgg': collectEgg(); break;
  case 'egg': layEgg(el); break;
  case 'animal': interactAnimal(el.dataset.name); break;
  case 'cow': interactAnimal('花花'); break;
  case 'pet': state.stars++; closeModal(); notify('💗 好朋友就是要互相陪伴！+1 彩虹星', 'reward'); updateHUD(); save(); break;
  case 'feed': if (count('corn')) { state.inventory.corn--; closeModal(); notify('🌽 动物朋友开心地吃了起来！', 'reward'); save(); updateHUD(); } else notify('背包里没有玉米，去菜地种一些吧！'); break;
  case 'milk': closeModal(); milk(); break;
  case 'plant': plant(); break;
  case 'harvest': harvest(); break;
  case 'selectPlot': plantAt(Number(el.dataset.index)); break;
  case 'cook': cook(item); break;
  case 'buy': buy(item); break;
  case 'shop': switchScene('shop'); break;
  case 'bag': renderBag(); break;
  case 'orders': closeModal(); showOrder(); break;
  case 'deliver': deliver(); break;
  case 'closeModal': closeModal(); break;
  case 'rest': state.day++; state.weather = (state.weather + 1) % 3; closeModal(); notify('🌤️ 新的一天开始啦！天气也变了。', 'reward'); updateHUD(); save(); break;
  case 'reset': state = structuredClone(initial); save(); updateHUD(); closeModal(); switchScene('ranch'); notify('新牧场准备好啦！欢迎回来！'); break;
  case 'resetAsk': modal('🌱 开始一段新旅程？', '<p class="modal-copy">你现在的农场进度会被新的冒险替代。</p><div class="modal-actions"><button data-action="reset">开始新牧场</button><button data-action="closeModal">再想想</button></div>'); break;
  case 'genderAsk': modal('🧑🏻‍🌾 选择你的农场伙伴', `<p class="modal-copy">男孩和女孩一样勇敢、一样会照顾动物！</p><div class="choice-row"><button class="choice-card ${state.character === 'boy' ? 'selected' : ''}" data-action="gender" data-gender="boy"><span>🧑🏻‍🌾</span>勇敢男孩</button><button class="choice-card ${state.character === 'girl' ? 'selected' : ''}" data-action="gender" data-gender="girl"><span>👩🏻‍🌾</span>快乐女孩</button></div>`); break;
  case 'gender': state.character = el.dataset.gender; save(); updateHUD(); closeModal(); notify('你的农场伙伴准备出发啦！'); break;
  case 'menu': modal('✨ 牧场小菜单', `<p class="modal-copy">进度会自动保存在这台设备上，刷新页面也不会消失。</p><div class="modal-actions"><button data-action="genderAsk">🧑🏻‍🌾 更换农场伙伴</button><button data-action="bag">🎒 查看背包</button><button data-action="resetAsk">🌱 重新开始</button><button data-action="closeModal">回到牧场</button></div>`); break;
} }
document.addEventListener('click', (event) => { const target = event.target.closest('[data-action],[data-scene]'); if (!target) return; if (target.dataset.scene) { closeModal(); switchScene(target.dataset.scene); return; } handle(target.dataset.action, target); });
$('modalBackdrop').addEventListener('click', (event) => { if (event.target === $('modalBackdrop')) closeModal(); });
$('menuButton').addEventListener('click', () => handle('menu'));
$('soundButton').addEventListener('click', () => { state.sound = !state.sound; $('soundButton').textContent = state.sound ? '🔊' : '🔇'; save(); notify(state.sound ? '轻轻的牧场声音打开啦。' : '声音关掉啦，继续安静地玩吧。'); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); if ((event.key === ' ' || event.key === 'Enter') && document.querySelector('.scene-coop.active')) collectEgg(); });
setInterval(() => { if (document.querySelector('.scene-garden.active')) renderGarden(); }, 5000);
const coop = $('scene-coop'); coop.addEventListener('transitionend', () => {});
// A light, locally generated rain overlay keeps the weather system asset-free.
setInterval(() => { if (state.weather === 2 && Math.random() < .35) { const drop = document.createElement('i'); drop.className = 'rain-drop'; drop.style.left = `${Math.random() * 100}%`; document.querySelector('.scene.active')?.append(drop); setTimeout(() => drop.remove(), 1000); } }, 300);
updateHUD(); switchScene('ranch');
setTimeout(() => { if (!localStorage.getItem(SAVE_KEY)) modal('🌈 欢迎来到彩虹牧场！', `<p class="modal-copy">这里没有考试和着急的事情，只有需要爱心照顾的动物、慢慢长大的蔬菜和等你分享礼物的朋友。</p><div class="choice-row"><button class="choice-card" data-action="gender" data-gender="boy"><span>🧑🏻‍🌾</span>勇敢男孩</button><button class="choice-card selected" data-action="gender" data-gender="girl"><span>👩🏻‍🌾</span>快乐女孩</button></div><div class="modal-actions"><button data-action="scene" data-scene="ranch">开始牧场生活 ✨</button></div>`); }, 180);
