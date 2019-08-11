// GAME ENGINE

const ENGINE = new function () {
    let ENGINE = this,
        cnv, ctx, width, height, nodes = [], node_count = 0, for_destroy = {},
        down_keys = {}, timer = 0, user_draw;

    let $ = (id) => {return document.getElementById(id)};

    let rect = (x, y, w, h, clr) => {
        ctx.fillStyle = clr;
        ctx.fillRect(x, y, w, h);
    };

    let text = (x, y, clr, text) => {
        ctx.fillStyle = clr;
        ctx.fillText(text, x, y);
    };

    class Node {
        constructor (x, y, w, h, clr, upd, health, img) {
            this.id = node_count++;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.clr = clr;
            this.update = upd;
            nodes.push(this);
            this.health = health;
        }

        _update () {
            if (this.update)
                this.update(this);
        }

        draw () {
            rect(this.x, this.y, this.w, this.h, this.clr);
        }

        destroy () {
            for_destroy[this.id] = this;
        }

        move (x, y) {
            this.x += x;
            this.y += y;
        }

        intersect (node) {
            return !(this.x+this.w < node.x || this.y+this.h < node.y || this.x > node.x+node.w || this.y > node.y+node.h);
        }
    }

    ENGINE.create_node = (x, y, w, h, clr, upd, health) => {
        return new Node(x, y, w, h, clr, upd, health);
    };

    ENGINE.draw_text = (x, y, clr, _text) => {
        text(x, y, clr, _text);
    };







    ENGINE.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length-1; i >= 0; i--) {
            if (for_destroy[nodes[i].id]) {
                nodes.splice(i, 1);
                continue;
            }
            nodes[i]._update();
            nodes[i].draw();
        }
        if (user_draw)
            user_draw(ENGINE);
        requestAnimationFrame(ENGINE.update);
        timer++;
    };

    ENGINE.key = (key) => {
        return down_keys[key];
    };

    ENGINE.clear_timer = () => {
        timer = 0;
    };

    ENGINE.get_timer = () => {
        return timer;
    };

    ENGINE.set_draw = (f) => {
        user_draw = f;
    };

    ENGINE.start = (W, H) => {
        cnv = $('cnv');
        ctx = cnv.getContext('2d');
        width = W;
        height = H;
        cnv.width = width;
        cnv.height = height;
        ctx.textBaseline = 'top';
        ctx.font = '20px Troika';

        window.addEventListener('keydown', (e) => {
            down_keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            delete down_keys[e.code];
        });

        ENGINE.update();
    };
  
};

window.addEventListener('load', function () {
    ENGINE.start(640, 720);

    let enemies = [], score = 0;

    // Monster speed
    let enemy_basic = (node) => {
        node.y += 2;
    };

    let enemy_fast = (node) => {
        node.y += 4;
    };

    let enemy_slow = (node) => {
        node.y += 1;
    };

    // Bullet function
    let bullet_ai = (node) => {
        node.y -= 5;
        if (node.y+node.h < 0)
            node.destroy();
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (node.intersect(enemies[i])&&enemies[i].health==1) {
                enemies[i].destroy();
                node.destroy();
                enemies.splice(i, 1);
                score += 1;
                break;
            }
            else if (node.intersect(enemies[i])&&enemies[i].health>1) {
                node.destroy();
                enemies[i].health--;
                break;
            }
        }
    };


// Monster generation
    for (let j = 0; j < 1000; j+=10) {
        for (let i = 0; i < 1; i++) {
            enemies.push(ENGINE.create_node(Math.floor(Math.random() * 570)+10, Math.floor(Math.random() * 200) * -(j+100), 40, 40, 'red', enemy_basic, 3));
        }
    }

    for (let j = 0; j < 1000; j+=10) {
        for (let i = 0; i < 1; i++) {
            enemies.push(ENGINE.create_node(Math.floor(Math.random() * 570)+10, Math.floor(Math.random() * 200) * -(j+100), 30, 30, 'blue', enemy_fast, 1));
        }
    }

    for (let j = 0; j < 1000; j+=10) {
        for (let i = 0; i < 1; i++) {
            enemies.push(ENGINE.create_node(Math.floor(Math.random() * 570)+10, Math.floor(Math.random() * 200) * -(j+100), 60, 60, 'green', enemy_slow, 7));
        }
    }


// Bullet firing    
    let fire = (x, y) => {
        if (ENGINE.get_timer() > 10) {
            ENGINE.create_node(x, y, 10, 20, '#14ff00', bullet_ai);
            ENGINE.clear_timer();
        }
    };

// Controls   
    ENGINE.create_node(640/2-25, 720-50-30, 50, 50, '#64c858',  (node) => {
        if (ENGINE.key('KeyA'))
            node.x -= 4;
        if (ENGINE.key('KeyD'))
            node.x += 4;
        if (ENGINE.key('Space'))
            fire(node.x+25-5, node.y);
    });

// Score    
    ENGINE.set_draw((s) => {
        s.draw_text(640/2-60, 5, '#8cff00', 'Игровой счет: '+score);
    });
});


