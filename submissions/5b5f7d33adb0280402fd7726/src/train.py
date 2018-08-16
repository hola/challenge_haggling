from functools import partial
import subprocess
import re
import multiprocessing
import os
import random
import math
import matplotlib.pyplot as plt
import itertools
import progressbar
import operator

alice_result_re = re.compile(r'Alice got \$(\d+)\.')
bob_result_re = re.compile(r'Bob got \$(\d+)\.')

alice_name_re = re.compile(r'Alice \(([^\)]*)\)')
bob_name_re = re.compile(r'Bob \(([^\)]*)\)')

points_re = re.compile(r'this.pointsY = ([^;])*;')
agent_points_re = re.compile(r'gen\/agent_\[([^\]]+)\]\.js')

def get_total(player1, player2, i, seed=None):
    total = {}
    command = ['node', 'src/haggle.js', '-u']
    if seed != None:
        command.append('-s {}'.format(seed))
    command.append(player1)
    command.append(player2)
    p = subprocess.run(command, check=True, stdout=subprocess.PIPE)
    output = p.stdout.decode('utf-8')
    #print(output)

    result = alice_result_re.search(output)
    name = alice_name_re.search(output).group(1)
    total[name] = int(result.group(1))

    result = bob_result_re.search(output)
    name = bob_name_re.search(output).group(1)
    total[name] = total.get(name, 0) + int(result.group(1))

    return total

def play_game(player1, player2, iterations = 0, seeds = None):
    with multiprocessing.Pool(processes=12) as pool:
        total = {}
        if seeds:
            f = partial(get_total, player1, player2, 0)
            inputs = seeds
        else:
            f = partial(get_total, player1, player2)
            inputs = range(iterations)
        for t in pool.imap_unordered(f, inputs):
            for k in t:
                total[k] = total.get(k, 0) + t[k]

        # for k in total:
        #     total[k] /= len(inputs)
        #print(total)
        return total

def gen_agent_with_points(points):
    agent_name = 'gen/agent_{}.js'.format(points)
    if os.path.exists(agent_name):
        return agent_name

    with open('src/agent.js', 'r') as f:
        agent = f.read()
    
    agent = points_re.sub('this.pointsY = {};'.format(points), agent)

    os.makedirs(os.path.dirname(agent_name), exist_ok=True)
    with open(agent_name, 'w') as f:
        f.write(agent)

    return agent_name

def clamp(min_value, max_value, value):
    return max(min_value, min(value, max_value))

def gen_seeds(n, seed = None):
    random_state = random.getstate()
    random.seed(seed)
    seeds = []
    for _ in range(n):
        seeds.append(random.randint(-10000000000,10000000000))
    random.setstate(random_state)
    return seeds

# example 16 diff 100 games = [9762172852, -2225978725, 8701325510, -7520953929, 6743930510]
# agent -10 diff 10 games (-946582050, -10), (-849680354, -10), (8117940911, -10), (4979278534, -10), (9455666031, -10), (-840091323, -10), (2647050354, -10)
def find_best_seeds():
    seeds = []
    total_diff = []
    iterations = 1000
    bar = progressbar.ProgressBar(widgets=[
        ' [', progressbar.Timer(), '] ',
        progressbar.Percentage(),
        progressbar.Bar(),
        ' (', progressbar.ETA(), ') ',
    ], max_value=iterations)

    for i in range(iterations):
        bar.update(i)
        seed = random.randint(-10000000000,10000000000)
        seeds.append(seed)

        total = play_game('src/agent.js', 'src/agent2.js', seeds = gen_seeds(10, seed))
        diff = total['agent.js'] - total['agent2.js']
        total_diff.append(diff)

    fig, ax = plt.subplots()
    ax.hist(total_diff, 'auto')
    fig.tight_layout()
    plt.show()

    avg = sum(total_diff) / len(total_diff)
    print("result:")
    print(avg)
    print(sorted(list(zip(seeds, total_diff)), key=lambda x: abs(x[1]-avg)))

# best agents with 100 seeds on 9762172852: ['gen/agent_[0.3333333333333333, 0.3333333333333333, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.3333333333333333, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.3333333333333333, 0.6666666666666666, 1.0].js', 'gen/agent_[0.3333333333333333, 0.3333333333333333, 1.0, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.6666666666666666, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 1.0].js', 'gen/agent_[0.3333333333333333, 0.6666666666666666, 1.0, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 0.6666666666666666, 1.0, 1.0].js', 'gen/agent_[0.3333333333333333, 1.0, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 1.0, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.3333333333333333, 1.0, 0.6666666666666666, 1.0].js', 'gen/agent_[0.3333333333333333, 1.0, 1.0, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.3333333333333333, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.3333333333333333, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.3333333333333333, 0.6666666666666666, 1.0].js', 'gen/agent_[0.6666666666666666, 0.3333333333333333, 1.0, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.6666666666666666, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.6666666666666666, 0.6666666666666666, 1.0].js', 'gen/agent_[0.6666666666666666, 0.6666666666666666, 1.0, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 0.6666666666666666, 1.0, 1.0].js', 'gen/agent_[0.6666666666666666, 1.0, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 1.0, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 1.0, 0.6666666666666666, 1.0].js', 'gen/agent_[0.6666666666666666, 1.0, 1.0, 0.6666666666666666].js', 'gen/agent_[0.6666666666666666, 1.0, 1.0, 1.0].js', 'gen/agent_[1.0, 0.3333333333333333, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[1.0, 0.3333333333333333, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[1.0, 0.3333333333333333, 0.6666666666666666, 1.0].js', 'gen/agent_[1.0, 0.3333333333333333, 1.0, 0.6666666666666666].js', 'gen/agent_[1.0, 0.6666666666666666, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[1.0, 0.6666666666666666, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[1.0, 0.6666666666666666, 0.6666666666666666, 1.0].js', 'gen/agent_[1.0, 0.6666666666666666, 1.0, 0.6666666666666666].js', 'gen/agent_[1.0, 0.6666666666666666, 1.0, 1.0].js', 'gen/agent_[1.0, 1.0, 0.3333333333333333, 0.6666666666666666].js', 'gen/agent_[1.0, 1.0, 0.6666666666666666, 0.6666666666666666].js', 'gen/agent_[1.0, 1.0, 0.6666666666666666, 1.0].js', 'gen/agent_[1.0, 1.0, 1.0, 0.6666666666666666].js', 'gen/agent_[1.0, 1.0, 1.0, 1.0].js']
def find_best_agents(seed):
    agents = []
    bar = progressbar.ProgressBar(widgets=[
        ' [', progressbar.Timer(), '] ',
        progressbar.Percentage(),
        progressbar.Bar(),
        ' (', progressbar.ETA(), ') ',
    ], max_value=4 ** 4)

    seeds = gen_seeds(100, seed)

    for i, points in enumerate(itertools.product([i/3 for i in range(0,4)], repeat=4)):
        bar.update(i)
        agent = gen_agent_with_points(list(points))
        agent_name = os.path.basename(agent)
        total = {}
        total_game = play_game(agent, 'src/example.js', seeds = seeds)
        for k in total_game:
            total[k] = total.get(k, 0) + total_game[k]
        total_game = play_game('src/example.js', agent, seeds = seeds)
        for k in total_game:
            total[k] = total.get(k, 0) + total_game[k]

        if total['example.js'] < total[agent_name]:
            agents.append(agent)

    return agents

# best player 100 games with seed 9762172852: gen/agent_[0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 1.0]
def tournament(agents, seeds, show_progress=True, _print=True):
    for agent in agents:
        m = agent_points_re.match(agent)
        if m:
            gen_agent_with_points([float(x) for x in m.group(1).split(',')])

    if show_progress:
        bar = progressbar.ProgressBar(widgets=[
            ' [', progressbar.Timer(), '] ',
            progressbar.Percentage(),
            progressbar.Bar(),
            ' (', progressbar.ETA(), ') ',
        ], max_value=len(agents) ** 2)

    scoreboard = {}
    for i, players in enumerate(itertools.product(agents, repeat=2)):
        if show_progress:
            bar.update(i)
        if players[0] == players[1]:
            continue
        total = play_game(players[0], players[1], seeds = seeds)
        for k in total:
            scoreboard[k] = scoreboard.get(k, 0) + total[k]

    if _print:
        for player in sorted([(k, scoreboard[k]) for k in scoreboard], key=lambda x: x[1], reverse=True):
            print(player)

    return scoreboard

def fitness(points, seeds):
    agent = gen_agent_with_points(points)
    agent_name = os.path.basename(agent)
    agents = ['src/example.js', gen_agent_with_points([0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 1.0]), gen_agent_with_points([0.46249999999999997, 0.8, 0.49375, 0.725])]
    agents.append(agent)
    scoreboard = tournament(agents, seeds, False, False)
    return scoreboard[agent_name]-max(scoreboard[k] for k in scoreboard)

# [0.46249999999999997, 0.8, 0.49375, 0.725]
def genetic(seeds, population_size, iterations):
    population = [[[random.randint(0,10)/10 for _ in range(4)], 0] for _ in range(population_size-1)]
    population.append([[0.46249999999999997, 0.8, 0.49375, 0.725], 0])
    for p in population:
        p[1] = fitness(p[0], seeds)
    population.sort(key=operator.itemgetter(1), reverse=True)
    print(population)

    for _ in range(iterations):
        selected = population[:int(population_size*0.4)]
        population = []
        best_child = [selected[0][0][::], 0]
        population.append(best_child)
        for _ in range(population_size-1):
            p1 = selected[random.randint(0,len(selected)-1)]
            p2 = selected[random.randint(0,len(selected)-1)]
            child = [p1[0][::], 0]
            i = random.randint(0,3)
            child[0][i] = 0.5 * (p1[0][i]+p2[0][i])

            # mutation
            i = random.randint(0,3)
            child[0][i] = clamp(0,1, child[0][i] + random.choice([0.1,-0.1]))

            population.append(child)
        for p in population:
            p[1] = fitness(p[0], seeds)
        population.sort(key=operator.itemgetter(1), reverse=True)
        print(population)

if __name__ == '__main__':
    best_seed = -946582050
    seeds = gen_seeds(10, best_seed)
    #find_best_seeds()
    #print(play_game('src/example.js', 'src/example2.js', seeds = seeds))
    #print(find_best_agents(best_seed))
    #tournament([gen_agent_with_points([0.3333333333333333, 0.6666666666666666, 0.6666666666666666, 1.0]), gen_agent_with_points([0.46249999999999997, 0.8, 0.49375, 0.725])], seeds)
    genetic(seeds, 10, 10) # [0.46249999999999997, 0.8, 0.49375, 0.725]