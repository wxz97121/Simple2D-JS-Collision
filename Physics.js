function newVec(x, y) {
    var res = Object.create(Vector);
    res.x = x;
    res.y = y;
    return res;
}
var Vector =
{
    x: 0,
    y: 0,
    z: 0,
    Length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },
    sqrLength: function () {
        return (this.x * this.x + this.y * this.y + this.z * this.z);
    },
    dot: function (other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    },
    Eplus: function (other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    },
    Esub: function (other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    },
    Emulti: function (other) {
        this.x *= other;
        this.y *= other;
        this.z *= other;
        return this;
    },
    plus: function (other) {
        var res = Object.create(Vector);
        res.x = this.x + other.x;
        res.y = this.y + other.y
        res.z = this.z + other.z;
        return res;
    },
    sub: function (other) {
        var res = Object.create(Vector);
        res.x = this.x - other.x;
        res.y = this.y - other.y;
        res.z = this.z - other.z;
        return res;
    },
    multi: function (other) {
        var res = Object.create(Vector);
        res.x = this.x * other;
        res.y = this.y * other;
        res.z = this.z * other;
        return res;
    },
    cross: function (other) {
        var res = Object.create(Vector);
        res.x = this.y * other.z - this.z * other.y;
        res.y = -this.z * other.x + this.x * other.z;
        res.z = this.x * other.y - this.y * other.x;
        return res;
    },
    normalize: function () {
        var res = Object.create(Vector);
        var len = this.Length();
        res.x = this.x / len;
        res.y = this.y / len;
        res.z = this.z / len;;
        return res;
    },
    perpendicular: function () {
        return newVec(this.y, -this.x);
    },
    dist: function (other) {
        return this.sub(other).Length();
    },

}
var Rect =
{
    Pos: Object.create(Vector),
    width: 30,
    height: 30,
    mass: 1,
    rad: 0,
    omega: 0.2,
    type: "Rect",
    velocity: Object.create(Vector),
    //Points:new Array(newVec(this.Pos.x-this.width/2,this.Pos.y-this.height/2),newVec(),newVec(),newVec()),
    draw: function (canva) {
        var ctx = canva.getContext("2d");
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.Pos.x, this.Pos.y);
        ctx.rotate(this.rad);
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
        ctx.closePath();
        ctx.stroke();
    },
    //recalc()
    //{
    //   m_Rect.Pos.plus(newVec(Math.cos(m_Rect.rad), Math.sin(m_Rect.rad)).multi(m_Rect.width / 2));
    //}

}
var Ball =
{
    Pos: Object.create(Vector),
    r: 30,
    mass: 1,
    rad: 0,
    omega: 0.2,
    type: "Ball",
    velocity: Object.create(Vector),
    dist: function (other) {
        var d = this.Pos.sub(other.Pos);
        return d.Length();
    },
    draw: function (canva) {
        var ctx = canva.getContext("2d");
        ctx.fillStyle = "#5FAA3A";
        ctx.beginPath();
        ctx.arc(this.Pos.x + this.r / 2 * Math.cos(this.rad), this.Pos.y + this.r / 2 * Math.sin(this.rad), this.r / 2.5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.Pos.x, this.Pos.y, this.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        //ctx.fill();
    },
    Coli: function (other, e) {
        var dv = this.velocity.sub(other.velocity);
        var dp = this.Pos.sub(other.Pos);
        if (dv.dot(dp) > 0) return;
        //var coefficient = dv.dot(dp) / dp.sqrLength();
        //this.velocity = this.velocity.sub(dp.multi(coefficient * 2 * other.mass / (this.mass + other.mass)));
        //other.velocity = other.velocity.plus(dp.multi(coefficient * 2 * this.mass / (this.mass + other.mass)));
        dp.multi(-1);
        dp = dp.normalize();
        var r1 = dp.multi(this.r / (this.r + other.r));
        var r2 = dp.multi(-other.r / (this.r + other.r));
        dv.Eplus(r1.multi(this.omega).sub(r2.multi(other.omega)));
        //console.log(dv);
        //console.log(dp);
        var J = -1 * dv.dot(dp) * (1 + e) / (1.0 / this.mass + 1.0 / other.mass
            + dp.dot(r1.cross(dp).multi(1.0 / (this.mass * this.r * this.r)).cross(r1))
            + dp.dot(r2.cross(dp).multi(1.0 / (other.mass * other.r * other.r)).cross(r2)));
        this.velocity.Eplus(dp.multi(J / this.mass));
        other.velocity.Esub(dp.multi(J / other.mass));
        //console.log(J);
        this.omega += (r1.cross(dp.multi(j)).sqrLength() / (this.mass * this.r * this.r));
        other.omega += (r2.cross(dp.multi(-j)).sqrLength() / (other.mass * other.r * other.r));
        console.log(this.omega);
        console.log(other.omega);
    }
}
function Dot(A, B) {
    return A.dot(B);
}
function CheckAndColi(mythis, other) {
    var dv = mythis.velocity.sub(other.velocity);
    var dp = mythis.Pos.sub(other.Pos);
    if (dv.dot(dp) > 0) return;
    if (mythis.type != other.type) {
        var m_Ball, m_Rect;
        if (other.type == "Ball") {
            m_Ball = other;
            m_Rect = mythis;
        }
        else {
            m_Ball = mythis;
            m_Rect = other;
        }
        var rad = m_Rect.rad, w = m_Rect.width, h = m_Rect.height;
        var RectX = newVec(Math.cos(rad), -Math.sin(rad));
        var RectY = newVec(Math.sin(rad), Math.cos(rad));
        var Point = new Array();
        Point[0] = m_Rect.Pos.plus(RectX.multi(w / 2).plus(RectY.multi(h / 2)));
        Point[1] = m_Rect.Pos.plus(RectX.multi(w / 2).plus(RectY.multi(-h / 2)));
        Point[2] = m_Rect.Pos.plus(RectX.multi(-w / 2).plus(RectY.multi(-h / 2)));
        Point[3] = m_Rect.Pos.plus(RectX.multi(-w / 2).plus(RectY.multi(h / 2)));
        for (P in Point) {
            var A = Point[P], B = Point[(P + 1) % 4], C = m_Ball.Pos, len;
            if (A.dist(B) < eps) len = B.dist(C);
            if (Dot(B.sub(A), C.sub(A)) < 0) len = A.dist(C);
            if (Dot(A.sub(B), C.sub(B)) < 0) len = B.dist(C);
            len = (B.sub(A).Cross(C.sub(A))).multi(1 / B.dist(A));
        }

    }
    //var coefficient = dv.dot(dp) / dp.sqrLength();
    //this.velocity = this.velocity.sub(dp.multi(coefficient * 2 * other.mass / (this.mass + other.mass)));
    //other.velocity = other.velocity.plus(dp.multi(coefficient * 2 * this.mass / (this.mass + other.mass)));
    dp.multi(-1);
    dp = dp.normalize();
    var r1 = dp.multi(this.r / (this.r + other.r));
    var r2 = dp.multi(-other.r / (this.r + other.r));
    dv.Eplus(r1.multi(this.omega).sub(r2.multi(other.omega)));
    //console.log(dv);
    //console.log(dp);
    var J = -1 * dv.dot(dp) * (1 + e) / (1.0 / this.mass + 1.0 / other.mass
        + dp.dot(r1.cross(dp).multi(1.0 / (this.mass * this.r * this.r)).cross(r1))
        + dp.dot(r2.cross(dp).multi(1.0 / (other.mass * other.r * other.r)).cross(r2)));
    this.velocity.Eplus(dp.multi(J / this.mass));
    other.velocity.Esub(dp.multi(J / other.mass));
    //console.log(J);
    this.omega += (r1.cross(dp.multi(j)).sqrLength() / (this.mass * this.r * this.r));
    other.omega += (r2.cross(dp.multi(-j)).sqrLength() / (other.mass * other.r * other.r));
    console.log(this.omega);
    console.log(other.omega);
}

function newBall(x, y, r) {
    var res = Object.create(Ball);
    res.velocity = Object.create(Vector);
    res.Pos = newVec(x, y);
    res.r = r;
    res.mass *= (r / 30);
    return res;
}
function DrawRes(mycanva) {
    var cxt = c.getContext("2d");
    cxt.clearRect(0, 0, mycanva.width, mycanva.height);

    testRect.rad += testRect.omega;
    testRect.draw(mycanva);

    for (i in World) {
        var bodyi = World[i];
        for (j in World) {
            if (j <= i) continue;
            var bodyj = World[j];
            if (bodyi.dist(bodyj) > (bodyi.r + bodyj.r)) continue;
            bodyi.Coli(bodyj, 1);
            //while ((bodyi.dist(bodyj) < (bodyi.r + bodyj.r-30))) bodyi.Pos.Eplus(bodyi.velocity.multi(0.001));
        }
        bodyi.velocity.y -= g;
        if (bodyi.Pos.x + bodyi.r > mycanva.width && bodyi.velocity.x > 0) bodyi.velocity.x *= -1;
        if (bodyi.Pos.x - bodyi.r < 0 && bodyi.velocity.x < 0) bodyi.velocity.x *= -1;
        if (bodyi.Pos.y + bodyi.r > mycanva.height && bodyi.velocity.y > 0) bodyi.velocity.y *= -1;
        if (bodyi.Pos.y - bodyi.r < 0 && bodyi.velocity.y < 0) bodyi.velocity.y *= -1;
        bodyi.Pos.Eplus(bodyi.velocity.multi(0.001));
        bodyi.rad += bodyi.omega;
        bodyi.draw(mycanva);
    }

}

var c = document.getElementById("myCanvas");
var World = new Array();
var g = 0;

var testRect = Object.create(Rect);
testRect.Pos = newVec(300, 300);

World.push(newBall(300, 400, 20));
World.push(newBall(500, 200, 30));
World.push(newBall(100, 100, 30));
World.push(newBall(400, 50, 40));
World.push(newBall(700, 200, 40));
World[0].velocity = newVec(5000, 2000);
World[0].omega = 0.05;
World[1].velocity = newVec(-800, -400);
World[2].velocity = newVec(10000, 1000);
World[2].omega = -0.3;
World[4].velocity = newVec(800, -400);
World[4].omega = 0.6;
World[3].velocity = newVec(-600, 5000);
setInterval("DrawRes(c)", 20);