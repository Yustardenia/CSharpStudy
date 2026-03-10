(function () {
  // `start` 仅为兼容旧写法保留，真实题号按 prefix 自动顺延。
  function buildGroup(prefix, section, category, startOrEntries, maybeEntries) {
    var entries = Array.isArray(startOrEntries) ? startOrEntries : maybeEntries;
    var next = buildGroup.counters[prefix] || 1;

    var group = entries.map(function (entry) {
      var question = {
        id: prefix + "-" + String(next).padStart(3, "0"),
        section: section,
        category: category,
        difficulty: entry.difficulty,
        tags: entry.tags,
        prompt: entry.prompt,
        intent: entry.intent,
        followUps: entry.followUps
      };

      next += 1;
      return question;
    });

    buildGroup.counters[prefix] = next;
    return group;
  }

  buildGroup.counters = {};

  var unityLifecycle = [
    {
      difficulty: "基础",
      tags: ["Awake", "OnEnable", "Start"],
      prompt: "如果面试官让你说明 Awake、OnEnable、Start 的调用时机和职责分工，你会怎么讲？",
      intent: ["考察生命周期顺序", "考察初始化职责划分"],
      followUps: ["如果对象是运行时 Instantiate 出来的，顺序会有什么变化？", "哪些初始化放在 Start 会比放在 Awake 更稳？"]
    },
    {
      difficulty: "基础",
      tags: ["Update", "FixedUpdate", "LateUpdate"],
      prompt: "请你比较 Update、FixedUpdate、LateUpdate 的执行特点，并分别举一个典型使用场景。",
      intent: ["考察帧循环理解", "考察物理和表现层逻辑划分"],
      followUps: ["跟物理相关的代码为什么通常不建议写在 Update？", "摄像机跟随为什么经常放在 LateUpdate？"]
    },
    {
      difficulty: "基础",
      tags: ["MonoBehaviour", "enabled", "回调"],
      prompt: "把脚本组件的 enabled 设为 false 后，哪些生命周期会停掉，哪些不会？",
      intent: ["考察脚本启停行为", "考察对回调边界的理解"],
      followUps: ["GameObject.SetActive(false) 和 enabled = false 的影响有什么不同？", "如果是协程在跑，脚本禁用后你会重点确认什么？"]
    },
    {
      difficulty: "进阶",
      tags: ["Instantiate", "SetActive", "生命周期"],
      prompt: "如果你实例化了一个默认是 inactive 的 Prefab，再在稍后把它激活，相关生命周期会怎样触发？",
      intent: ["考察对象激活时机", "考察对初始化顺序的推演能力"],
      followUps: ["这个过程中 Awake 和 Start 是否都会立刻执行？", "你会怎样避免第一次激活时初始化顺序混乱？"]
    },
    {
      difficulty: "基础",
      tags: ["OnDisable", "OnDestroy", "清理"],
      prompt: "OnDisable 和 OnDestroy 分别适合做什么清理工作？为什么很多事件解绑更适合写在 OnDisable？",
      intent: ["考察资源释放意识", "考察对象销毁与停用的区别"],
      followUps: ["对象被对象池回收时，更应该依赖哪个回调？", "如果把所有清理都塞进 OnDestroy，常见风险是什么？"]
    },
    {
      difficulty: "基础",
      tags: ["Coroutine", "yield", "调度"],
      prompt: "协程里常见的 yield return null、WaitForSeconds、WaitForEndOfFrame 分别会让逻辑在什么时候继续？",
      intent: ["考察协程调度理解", "考察对等待时机的把握"],
      followUps: ["如果 Time.timeScale 变成 0，WaitForSeconds 会发生什么？", "什么时候 WaitForEndOfFrame 比 yield return null 更合适？"]
    },
    {
      difficulty: "进阶",
      tags: ["Coroutine", "Disable", "Destroy"],
      prompt: "一个脚本上启动的协程，在脚本禁用、GameObject 失活、对象销毁这三种情况下会怎样？",
      intent: ["考察协程和宿主生命周期关系", "考察对边界条件的理解"],
      followUps: ["如果你做对象池，回收前会不会主动停协程？", "为什么只靠默认行为有时会留下隐藏状态问题？"]
    },
    {
      difficulty: "进阶",
      tags: ["Script Execution Order", "初始化", "依赖"],
      prompt: "什么情况下你会考虑改 Script Execution Order，而不是继续在代码里兜底？",
      intent: ["考察初始化依赖管理", "考察是否滥用执行顺序配置"],
      followUps: ["如果多个系统互相依赖，你会怎样减少对 Script Execution Order 的依赖？", "团队项目里滥改执行顺序会带来什么维护风险？"]
    },
    {
      difficulty: "基础",
      tags: ["SceneManager", "LoadScene", "Additive"],
      prompt: "请你比较单场景加载和 Additive 场景加载在对象生命周期上的主要差异。",
      intent: ["考察场景切换理解", "考察多场景架构基础"],
      followUps: ["切场景时哪些对象会被销毁，哪些可能保留？", "Additive 模式下你会怎么处理跨场景管理器？"]
    },
    {
      difficulty: "基础",
      tags: ["DontDestroyOnLoad", "Singleton", "场景切换"],
      prompt: "很多人用 DontDestroyOnLoad 做全局管理器，你觉得它最容易出什么问题？",
      intent: ["考察跨场景对象管理", "考察单例重复实例问题"],
      followUps: ["如果切回启动场景又生成了一次管理器，你会怎么处理？", "除了 DontDestroyOnLoad，还有哪些更稳的全局服务组织方式？"]
    },
    {
      difficulty: "基础",
      tags: ["Time.deltaTime", "fixedDeltaTime", "unscaledDeltaTime"],
      prompt: "Time.deltaTime、Time.fixedDeltaTime、Time.unscaledDeltaTime 这三个值各自更适合用在什么地方？",
      intent: ["考察时间系统理解", "考察暂停和物理更新场景"],
      followUps: ["做暂停菜单动画时为什么经常要用 unscaledDeltaTime？", "如果角色位移放在 FixedUpdate，却又乘了 deltaTime，会有什么问题？"]
    },
    {
      difficulty: "进阶",
      tags: ["OnApplicationPause", "OnApplicationFocus", "移动端"],
      prompt: "在移动端项目里，OnApplicationPause 和 OnApplicationFocus 你通常会拿来处理哪些事情？",
      intent: ["考察移动端生命周期意识", "考察后台恢复流程"],
      followUps: ["如果玩家切到后台时正在下载资源，你会优先保护哪些状态？", "为什么有些逻辑不能只依赖 OnApplicationFocus？"]
    },
    {
      difficulty: "基础",
      tags: ["Destroy", "Frame", "FakeNull"],
      prompt: "调用 Destroy(obj) 之后，这个对象在当前帧和下一帧分别是什么状态？为什么 Unity 里的 null 判断经常让新人困惑？",
      intent: ["考察对象销毁时机", "考察 Unity 自定义对象空判断"],
      followUps: ["为什么对象看起来还在，但判断已经像 null 了？", "你会怎样避免销毁后继续访问组件导致的报错？"]
    },
    {
      difficulty: "基础",
      tags: ["Invoke", "InvokeRepeating", "Coroutine"],
      prompt: "延时执行逻辑时，你会怎么比较 Invoke、InvokeRepeating 和 Coroutine 的适用边界？",
      intent: ["考察延时任务组织方式", "考察可维护性判断"],
      followUps: ["如果延时逻辑需要取消、重入或者串联多个步骤，你更倾向哪一种？", "为什么有些团队会尽量少用字符串形式的 Invoke？"]
    },
    {
      difficulty: "进阶",
      tags: ["Domain Reload", "静态变量", "PlayMode"],
      prompt: "如果 Unity 里关闭了 Domain Reload，哪些静态数据和初始化逻辑最容易出问题？",
      intent: ["考察编辑器运行机制理解", "考察静态状态污染风险"],
      followUps: ["这会对单例和缓存类产生什么影响？", "你会怎样让初始化逻辑在多次进入 PlayMode 时仍然稳定？"]
    }
  ];

  var unitySystems = [
    {
      difficulty: "基础",
      tags: ["SerializeField", "public", "序列化"],
      prompt: "Unity 里 [SerializeField] private 字段和 public 字段都能暴露到 Inspector，它们在设计意图上怎么区分？",
      intent: ["考察封装意识", "考察 Unity 序列化基础"],
      followUps: ["为什么属性默认不能像字段那样直接序列化？", "你会在什么情况下坚持不用 public 暴露运行时状态？"]
    },
    {
      difficulty: "基础",
      tags: ["GetComponent", "Inspector", "依赖注入"],
      prompt: "如果一个组件依赖另一个组件，你会优先在 Awake 里 GetComponent，还是在 Inspector 里拖引用？",
      intent: ["考察依赖管理习惯", "考察可读性和运行时开销权衡"],
      followUps: ["什么时候拖引用更安全，什么时候动态查找更灵活？", "如果引用丢失，你会怎样在开发阶段尽早暴露问题？"]
    },
    {
      difficulty: "进阶",
      tags: ["事件通信", "UnityEvent", "解耦"],
      prompt: "你会怎么比较直接引用调用、C# event、UnityEvent 这三种组件通信方式？",
      intent: ["考察组件解耦思路", "考察对编辑器友好度和性能的平衡"],
      followUps: ["什么场景下 UnityEvent 的编辑器配置优势更明显？", "如果是高频事件，为什么很多人仍然更偏向 C# event？"]
    },
    {
      difficulty: "进阶",
      tags: ["Interface", "GetComponent", "模块化"],
      prompt: "如果你希望不同组件只暴露统一能力，而不暴露具体实现，你会怎么用接口配合 GetComponent？",
      intent: ["考察抽象设计能力", "考察 Unity 中接口使用方式"],
      followUps: ["Inspector 不能直接拖接口时，你通常怎么处理？", "接口方案在大型项目里最容易踩到的坑是什么？"]
    },
    {
      difficulty: "基础",
      tags: ["ScriptableObject", "配置", "共享数据"],
      prompt: "你会怎么向面试官解释 ScriptableObject 更适合做配置，而不是随手拿来装运行时临时状态？",
      intent: ["考察资源对象定位", "考察运行时数据边界"],
      followUps: ["如果多个对象共享同一个 ScriptableObject 资源，运行时修改会有什么后果？", "什么时候你会专门克隆一份运行时实例？"]
    },
    {
      difficulty: "基础",
      tags: ["Prefab", "Variant", "复用"],
      prompt: "Prefab Variant 适合解决什么问题？它和直接复制一个 Prefab 有什么本质差别？",
      intent: ["考察资源复用思路", "考察 Prefab 继承关系理解"],
      followUps: ["如果底层 Prefab 改了，Variant 上哪些修改会保留？", "什么时候 Variant 层级太深反而会拖累维护？"]
    },
    {
      difficulty: "进阶",
      tags: ["Nested Prefab", "Override", "排查"],
      prompt: "团队里经常有人抱怨 Prefab 修改没生效，你会怎么排查嵌套 Prefab 和 Override 覆盖关系？",
      intent: ["考察 Prefab 变体覆盖理解", "考察资源问题排查思路"],
      followUps: ["什么时候应该 Apply，什么时候应该 Revert？", "如果场景实例、外层 Prefab、内层 Prefab 都改过，你会先看哪一层？"]
    },
    {
      difficulty: "基础",
      tags: ["Scene", "传参", "切场景"],
      prompt: "切换场景时如果需要把数据带给下一个场景，你更倾向怎么做，而不是直接依赖静态变量乱传？",
      intent: ["考察场景间数据传递设计", "考察状态管理意识"],
      followUps: ["小项目和中型项目在这个问题上的做法会有什么不同？", "如果场景是异步加载的，你会怎样保证接收方初始化时数据已经准备好？"]
    },
    {
      difficulty: "进阶",
      tags: ["Additive", "场景拆分", "依赖"],
      prompt: "如果一个项目用 Additive 场景拆 UI、战斗、灯光和全局管理器，你会怎么控制这些场景之间的依赖关系？",
      intent: ["考察多场景架构思路", "考察模块边界设计"],
      followUps: ["哪些场景应该常驻，哪些应该按需装卸？", "如果一个子场景未加载完成，依赖它的模块该怎么兜底？"]
    },
    {
      difficulty: "基础",
      tags: ["RectTransform", "Anchor", "Pivot"],
      prompt: "做自适应 UI 时，Anchor 和 Pivot 最容易被混淆，你会怎么讲清它们各自控制的东西？",
      intent: ["考察 UI 布局基础", "考察屏幕适配经验"],
      followUps: ["为什么同样的坐标改了 Anchor 后看起来会跑位？", "如果一个面板在不同分辨率下偏移异常，你会先查哪里？"]
    },
    {
      difficulty: "基础",
      tags: ["Button", "Lambda", "循环绑定"],
      prompt: "动态生成一排按钮时，为什么很多人给 onClick 绑 lambda 会出现所有按钮都点出同一个结果？",
      intent: ["考察闭包基础和 Unity UI 绑定", "考察常见 UI Bug 经验"],
      followUps: ["你通常怎么修这个问题？", "除了按钮，类似闭包问题还容易出现在什么地方？"]
    },
    {
      difficulty: "进阶",
      tags: ["UI", "Raycast", "EventSystem"],
      prompt: "如果一个 UI 明明在屏幕上，却点不到，你会从 GraphicRaycaster、Raycast Target 和遮挡关系这几个方向怎么排查？",
      intent: ["考察 UI 事件系统理解", "考察问题定位思路"],
      followUps: ["为什么有些纯装饰图也可能挡住点击？", "多 Canvas 或 3D 物体叠在一起时，你还会检查什么？"]
    },
    {
      difficulty: "基础",
      tags: ["Collider", "Trigger", "Rigidbody"],
      prompt: "请你比较 Collider 触发器和碰撞器的区别，并说明常见的 Rigidbody 配置要求。",
      intent: ["考察物理交互基础", "考察触发条件理解"],
      followUps: ["为什么两个纯静态 Collider 往往不会触发你预期的回调？", "做子弹命中检测时，你会优先用 Trigger 还是 Collision？"]
    },
    {
      difficulty: "基础",
      tags: ["Rigidbody", "MovePosition", "AddForce"],
      prompt: "控制 Rigidbody 物体移动时，直接改 transform.position、用 MovePosition、用 AddForce 各有什么差异？",
      intent: ["考察物理对象移动方式", "考察正确使用 Rigidbody"],
      followUps: ["为什么直接改 transform 可能会破坏物理表现？", "角色控制和抛物线受力这两类需求，你会分别选哪种方式？"]
    },
    {
      difficulty: "进阶",
      tags: ["GetComponentInChildren", "Inactive", "层级"],
      prompt: "GetComponentInChildren 和 GetComponentInParent 在复杂层级里很好用，但它们有哪些容易被忽略的边界？",
      intent: ["考察组件查找范围理解", "考察层级结构排错能力"],
      followUps: ["默认情况下 inactive 子节点会不会被搜到？", "如果查找结果不稳定，你会怎样让依赖更显式？"]
    }
  ];

  var unityPerformance = [
    {
      difficulty: "基础",
      tags: ["Profiler", "Spike", "定位"],
      prompt: "如果面试官问你“游戏偶发卡顿你第一步看什么”，你会怎么描述一个靠谱的 Profiler 排查顺序？",
      intent: ["考察性能排查流程", "考察是否有实战定位思路"],
      followUps: ["你会先看 CPU、GPU 还是内存？为什么？", "如果尖峰只在设备上出现，编辑器里看不到，你会怎么补信息？"]
    },
    {
      difficulty: "基础",
      tags: ["GC", "Alloc", "Update"],
      prompt: "Unity 里最常见的 GC Alloc 来源有哪些？哪些写法最容易在 Update 里偷偷制造垃圾？",
      intent: ["考察托管分配意识", "考察常见性能陷阱"],
      followUps: ["字符串拼接、LINQ、装箱各自为什么容易出问题？", "你会怎么确认到底是哪段代码在分配？"]
    },
    {
      difficulty: "基础",
      tags: ["Object Pool", "复用", "实例化"],
      prompt: "对象池最适合解决什么问题？什么类型的对象并不一定值得硬上对象池？",
      intent: ["考察对象池使用边界", "考察性能优化取舍意识"],
      followUps: ["为什么短生命周期且高频生成的对象通常更适合对象池？", "哪些复杂对象复用成本可能比重新创建还高？"]
    },
    {
      difficulty: "进阶",
      tags: ["UnityEngine.Pool.ObjectPool", "重置状态", "回收"],
      prompt: "如果你用 Unity 自带的 ObjectPool<T> 做复用，回收和再次取出时最关键的状态重置点有哪些？",
      intent: ["考察对象池落地细节", "考察隐藏状态污染风险"],
      followUps: ["粒子、协程、事件订阅、父子节点这些状态你会怎么处理？", "为什么很多对象池 Bug 都不是出在“取不到对象”，而是出在“对象没洗干净”？"]
    },
    {
      difficulty: "基础",
      tags: ["Addressables", "Resources", "资源管理"],
      prompt: "Addressables 和 Resources 都能把资源加载出来，但你会怎么说明它们在项目管理层面的差别？",
      intent: ["考察资源系统选型能力", "考察对可维护性和更新能力的理解"],
      followUps: ["为什么很多团队会避免继续扩张 Resources 目录？", "如果要做远端热更资源，你为什么更倾向 Addressables？"]
    },
    {
      difficulty: "进阶",
      tags: ["Addressables", "Remote", "更新"],
      prompt: "如果项目要支持不发整包就更新活动资源，你会怎么说明 Addressables 的整体思路？",
      intent: ["考察远端资源更新理解", "考察资源版本管理思路"],
      followUps: ["Catalog、分组、依赖和缓存各自大概扮演什么角色？", "如果线上资源更新后出现版本不一致，你会先排查什么？"]
    },
    {
      difficulty: "基础",
      tags: ["LoadSceneAsync", "Progress", "0.9"],
      prompt: "为什么 LoadSceneAsync 的进度经常卡在 0.9，看起来像没加载完？你会怎么解释这个现象？",
      intent: ["考察异步场景加载细节", "考察对激活阶段的理解"],
      followUps: ["allowSceneActivation 会怎样影响这个过程？", "如果你要做加载页，进度条应该怎么更真实地表现给玩家？"]
    },
    {
      difficulty: "基础",
      tags: ["Texture", "Compression", "Memory"],
      prompt: "移动端资源优化里，纹理压缩、尺寸控制、MipMap 开关这几个点你会怎么向面试官讲？",
      intent: ["考察纹理内存基础", "考察移动端资源优化意识"],
      followUps: ["UI 图和场景贴图在这些设置上通常有什么差异？", "为什么有些问题不是帧率掉，而是内存爆和加载慢？"]
    },
    {
      difficulty: "进阶",
      tags: ["Draw Call", "Batching", "SRP Batcher"],
      prompt: "你会怎么用简单但不失真确的方式解释 Draw Call、Batching 和 SRP Batcher？",
      intent: ["考察渲染性能基础", "考察是否能把原理讲清楚"],
      followUps: ["为什么材质球变化经常会破坏批处理？", "如果批次很多，你会优先从模型、材质还是 UI 下手？"]
    },
    {
      difficulty: "进阶",
      tags: ["Canvas", "Overdraw", "Rebuild"],
      prompt: "UGUI 卡顿时，Canvas 重建和 Overdraw 往往是两个热点。你会怎么区分这两类问题？",
      intent: ["考察 UI 性能定位能力", "考察重绘和过度绘制概念理解"],
      followUps: ["为什么一个大 Canvas 上小改动也可能引发大范围重建？", "什么时候拆 Canvas 是有效优化，什么时候会适得其反？"]
    },
    {
      difficulty: "进阶",
      tags: ["Async", "Main Thread", "加载卡顿"],
      prompt: "资源异步加载了，为什么主线程仍然可能卡？你会怎么跟面试官解释“异步不等于完全不卡”？",
      intent: ["考察对 Unity 主线程限制的理解", "考察异步加载认知是否真实"],
      followUps: ["实例化、反序列化、激活资源通常会在哪一侧产生负担？", "如果加载结束瞬间卡一下，你会先怀疑哪一步？"]
    },
    {
      difficulty: "基础",
      tags: ["Debug.Log", "Development Build", "Deep Profile"],
      prompt: "你会怎么比较 Debug.Log、Development Build、Deep Profile 这几种手段在性能问题排查时的价值和代价？",
      intent: ["考察调试工具使用边界", "考察是否知道工具本身也会带来开销"],
      followUps: ["为什么 Deep Profile 不能长期开着看“真实帧率”？", "线上包和开发包的表现差异，你会怎么跟面试官说明？"]
    },
    {
      difficulty: "进阶",
      tags: ["Memory Leak", "Static", "Event"],
      prompt: "Unity 里有哪些“看起来没泄漏，其实对象一直被引用着”的典型内存问题？",
      intent: ["考察托管引用泄漏意识", "考察事件和静态缓存风险"],
      followUps: ["静态集合和事件订阅为什么特别容易让对象活得太久？", "你会用什么方式确认对象确实没有被释放？"]
    },
    {
      difficulty: "基础",
      tags: ["Device", "Editor", "诊断"],
      prompt: "编辑器里很流畅，但真机上卡得明显，你会按什么顺序去定位差异？",
      intent: ["考察设备侧调试流程", "考察是否真正做过真机排查"],
      followUps: ["分辨率、贴图格式、CPU/GPU、脚本开销这些维度你会先看哪个？", "为什么只看编辑器表现经常会误判问题优先级？"]
    },
    {
      difficulty: "进阶",
      tags: ["Release", "线上问题", "诊断方案"],
      prompt: "如果只在发布包里出现性能或稳定性问题，而开发环境难以复现，你会怎么补齐诊断信息？",
      intent: ["考察线上问题排查意识", "考察日志和埋点方案"],
      followUps: ["你会提前在项目里预埋哪些轻量级监控？", "为什么“本地没复现”不能说明这个问题不值得追？"]
    }
  ];

  var unityProject = [
    {
      difficulty: "基础",
      tags: ["对象池", "子弹", "高频生成"],
      prompt: "如果是弹幕型项目，屏幕上同时有上千发子弹，你会怎么向面试官讲你的对象池和更新策略？",
      intent: ["考察高频对象复用设计", "考察性能优化表达能力"],
      followUps: ["你会怎么减少每发子弹自己的 Update 成本？", "如果子弹表现和碰撞逻辑分离，架构上怎么做更稳？"]
    },
    {
      difficulty: "基础",
      tags: ["ScrollView", "虚拟列表", "UI 优化"],
      prompt: "商品列表一打开就卡，尤其是一百多个商品格子同时出现时，你会怎么拆这个问题？",
      intent: ["考察列表 UI 优化思路", "考察定位拆解能力"],
      followUps: ["对象复用、异步图标加载、Canvas 拆分你会怎么排序处理？", "如果面试官追问‘你怎么证明优化有效’，你会给出什么指标？"]
    },
    {
      difficulty: "进阶",
      tags: ["启动加载", "低端机", "首帧"],
      prompt: "项目启动场景在低端安卓机上要等很久，你会怎么做一个现实可落地的提速方案？",
      intent: ["考察加载流程优化能力", "考察首帧体验意识"],
      followUps: ["哪些内容必须首包加载，哪些可以延后？", "如果资源和逻辑初始化都很多，你会怎么分阶段？"]
    },
    {
      difficulty: "进阶",
      tags: ["Addressables", "活动资源", "热更新"],
      prompt: "运营临时要上一批新活动美术，不想重新发整包。你会怎么设计资源交付流程？",
      intent: ["考察资源热更新方案", "考察和运营需求对接能力"],
      followUps: ["活动结束后资源要不要清理缓存？依据是什么？", "如果远端资源下载失败，你会怎样让玩家体验可接受？"]
    },
    {
      difficulty: "进阶",
      tags: ["事件系统", "场景切换", "空引用"],
      prompt: "切场景后偶发空引用，最后发现是某个全局事件还在回调已经销毁的对象。你会怎么改这类系统？",
      intent: ["考察事件生命周期管理", "考察线上稳定性修复思路"],
      followUps: ["你会把解绑放在 OnDisable、OnDestroy 还是统一托管？", "如果历史代码很多，怎么渐进式治理而不是一口气推翻？"]
    },
    {
      difficulty: "进阶",
      tags: ["架构", "Manager", "模块通信"],
      prompt: "中型 Unity 项目里，系统越来越多时，你会如何避免所有模块都互相直接找 Manager？",
      intent: ["考察中型项目架构意识", "考察模块耦合控制能力"],
      followUps: ["哪些公共能力适合沉成服务，哪些又不该做成万能总管？", "如果团队里大家写法不统一，你会如何约束落地？"]
    },
    {
      difficulty: "基础",
      tags: ["存档", "版本兼容", "数据结构"],
      prompt: "设计本地存档时，你会怎样考虑数据结构、版本兼容和异常恢复，而不是只想着“能存出来”就行？",
      intent: ["考察数据持久化思维", "考察长期维护意识"],
      followUps: ["如果线上版本升级后字段变了，你会怎么兼容旧档？", "玩家断电或强退时，怎样减少存档损坏概率？"]
    },
    {
      difficulty: "基础",
      tags: ["协作", "场景冲突", "Prefab"],
      prompt: "多人协作开发 Unity 项目时，场景和 Prefab 最容易产生冲突。你会怎么安排资源和场景分工来降低冲突？",
      intent: ["考察团队协作经验", "考察资源组织规范意识"],
      followUps: ["什么时候你会建议更多使用 Prefab 而不是直接在场景里改？", "美术、策划、程序一起改资源时，流程上怎么更稳？"]
    },
    {
      difficulty: "进阶",
      tags: ["SDK", "线程", "主线程"],
      prompt: "第三方 SDK 回调有时不在 Unity 主线程，如果它回调里直接操作 GameObject 报错，你会怎么收敛这类问题？",
      intent: ["考察线程安全意识", "考察外部回调接入能力"],
      followUps: ["你会怎样把回调切回主线程再执行 Unity API？", "如果多个 SDK 都有类似问题，你会不会做一层统一适配？"]
    },
    {
      difficulty: "进阶",
      tags: ["重连", "状态恢复", "战斗场景"],
      prompt: "网络重连后要恢复战斗场景，你会从‘本地表现恢复’和‘服务端权威状态同步’两侧怎么思考？",
      intent: ["考察场景恢复思路", "考察客户端与服务端状态边界"],
      followUps: ["哪些内容可以本地立刻恢复，哪些一定要等服务端下发？", "如果重连时资源还没准备好，客户端该如何过渡？"]
    },
    {
      difficulty: "基础",
      tags: ["Pause", "Background", "Resume"],
      prompt: "游戏切到后台再切回来时，哪些系统最值得优先检查，避免出现假死、音效错乱或 UI 状态错位？",
      intent: ["考察移动端恢复流程", "考察多系统状态同步能力"],
      followUps: ["计时器、下载、音频、网络重连你会怎么分优先级？", "如果后台停留很久再回来，你还会多做什么保护？"]
    },
    {
      difficulty: "进阶",
      tags: ["Additive", "模块化", "活动场景"],
      prompt: "如果一个游戏里常驻主场景，再按需加载活动、战斗、剧情子场景，你会怎么设计模块边界？",
      intent: ["考察多场景模块化能力", "考察常驻层和业务层分层意识"],
      followUps: ["哪些服务适合常驻，哪些资源应该跟随子场景释放？", "模块被卸载时你会重点清哪些状态？"]
    },
    {
      difficulty: "进阶",
      tags: ["A/B", "远端配置", "运营活动"],
      prompt: "如果运营要做 A/B 活动配置，而客户端又希望尽量少发版本，你会怎么组织远端配置和本地兜底？",
      intent: ["考察线上运营支持思路", "考察配置驱动设计"],
      followUps: ["远端配置失败时，客户端默认策略应该是什么？", "如何避免策划配错导致整条活动链路直接崩掉？"]
    },
    {
      difficulty: "进阶",
      tags: ["Android", "Crash", "线上排查"],
      prompt: "如果某个崩溃只在少数安卓机型出现，你会怎样制定一个尽量高效的排查路径？",
      intent: ["考察线上 Crash 处理能力", "考察设备差异排查意识"],
      followUps: ["你会先看崩溃日志、设备信息、资源格式还是第三方 SDK？", "如果短时间复现不了，你会怎样先降低风险？"]
    },
    {
      difficulty: "基础",
      tags: ["优化复盘", "表达", "项目经历"],
      prompt: "面试官让你讲一次最有代表性的性能优化经历时，你会怎么把‘问题、定位、方案、收益’讲得有条理？",
      intent: ["考察项目表达能力", "考察是否能把优化工作讲清楚"],
      followUps: ["如果收益不止一项指标，你会优先强调哪几个？", "怎样避免把‘做了很多事’讲成‘没有结论的流水账’？"]
    }
  ];

  var csharpBasic = [
    {
      difficulty: "基础",
      tags: ["class", "struct", "值类型"],
      prompt: "你会怎么解释 class 和 struct 的核心区别，以及什么场景下 struct 更合适？",
      intent: ["考察引用类型和值类型基础", "考察类型选择意识"],
      followUps: ["为什么 struct 通常更适合体量小、语义上就是值的数据？", "如果 struct 里字段很多、又频繁拷贝，会出现什么代价？"]
    },
    {
      difficulty: "基础",
      tags: ["值类型", "引用类型", "赋值"],
      prompt: "请你用一个简单例子说明值类型赋值和引用类型赋值在行为上的差异。",
      intent: ["考察内存语义基础", "考察是否能把抽象概念说成具体例子"],
      followUps: ["为什么很多新手会误以为 List<T> 传参时会“复制一份”？", "数组元素如果是引用类型，这个结论又要怎么讲？"]
    },
    {
      difficulty: "基础",
      tags: ["ref", "out", "in"],
      prompt: "ref、out、in 这三个参数修饰符你会怎么区分？",
      intent: ["考察参数传递机制", "考察语义边界是否清楚"],
      followUps: ["out 为什么要求方法内部必须赋值？", "in 参数为什么有时能减少复制，但并不总是适合滥用？"]
    },
    {
      difficulty: "基础",
      tags: ["string", "不可变", "性能"],
      prompt: "为什么说 string 是不可变的？这件事和性能优化有什么关系？",
      intent: ["考察字符串不可变性", "考察常见性能意识"],
      followUps: ["频繁拼接字符串时为什么往往建议考虑 StringBuilder？", "在 Unity 的高频逻辑里，字符串为什么经常被当成隐藏 GC 来源？"]
    },
    {
      difficulty: "基础",
      tags: ["const", "readonly", "static readonly"],
      prompt: "const、readonly、static readonly 在使用场景上你会怎么区分？",
      intent: ["考察常量与只读字段理解", "考察初始化时机区别"],
      followUps: ["为什么 const 更适合真正永远不会变的编译期常量？", "static readonly 更适合哪些配置型值？"]
    },
    {
      difficulty: "基础",
      tags: ["overload", "override", "new"],
      prompt: "重载、重写、new 隐藏成员这三件事，你会怎么给面试官讲清差别？",
      intent: ["考察面向对象多态基础", "考察语法概念是否混淆"],
      followUps: ["override 为什么需要 virtual 或 abstract 作为前提？", "new 隐藏成员为什么容易制造理解成本？"]
    },
    {
      difficulty: "基础",
      tags: ["interface", "abstract class", "设计"],
      prompt: "接口和抽象类都能表达抽象能力，你通常怎么决定用哪个？",
      intent: ["考察抽象建模意识", "考察继承与组合权衡"],
      followUps: ["如果你既想给默认实现，又想允许多种能力组合，会怎么设计？", "在 Unity 项目里，接口常和哪些模式搭配使用？"]
    },
    {
      difficulty: "基础",
      tags: ["field", "property", "封装"],
      prompt: "字段和属性除了写法不同，在设计上最重要的区别是什么？",
      intent: ["考察封装和访问控制意识", "考察属性的扩展价值"],
      followUps: ["什么时候一个简单字段也值得升级成属性？", "为什么很多公开状态不建议直接暴露 public field？"]
    },
    {
      difficulty: "基础",
      tags: ["Array", "List<T>", "集合"],
      prompt: "数组和 List<T> 都能装一组数据，你会怎么比较它们的使用边界？",
      intent: ["考察基础集合选择", "考察容量和操作语义区别"],
      followUps: ["如果长度固定且访问特别频繁，你通常更偏向哪个？", "List<T> 扩容时为什么会带来额外成本？"]
    },
    {
      difficulty: "基础",
      tags: ["Dictionary", "HashSet", "查找"],
      prompt: "Dictionary<TKey, TValue> 和 HashSet<T> 在使用目标上有什么根本差别？",
      intent: ["考察集合特征理解", "考察查找型数据结构选择"],
      followUps: ["如果你只关心“有没有”，为什么 HashSet 往往比 Dictionary 更直接？", "做去重和做键值映射时，你会怎样向面试官描述差异？"]
    },
    {
      difficulty: "基础",
      tags: ["==", "Equals", "ReferenceEquals"],
      prompt: "==、Equals、ReferenceEquals 这三个比较方式你会怎么区分？",
      intent: ["考察相等性语义", "考察值相等和引用相等概念"],
      followUps: ["string 为什么看起来经常“== 也好用”？", "如果你自定义一个类型作为字典键，为什么只重写 Equals 还不够？"]
    },
    {
      difficulty: "基础",
      tags: ["Boxing", "Unboxing", "性能"],
      prompt: "什么是装箱和拆箱？它们为什么既有性能代价，又可能带来类型错误风险？",
      intent: ["考察值类型与 object 交互机制", "考察性能和类型安全意识"],
      followUps: ["在泛型出现后，为什么很多场景能避免不必要的装箱？", "Unity 项目里哪些地方最容易在不知不觉中发生装箱？"]
    },
    {
      difficulty: "基础",
      tags: ["Nullable", "??", "?."],
      prompt: "你会怎么解释可空值类型、空条件运算符和空合并运算符各自解决了什么问题？",
      intent: ["考察空值处理基础", "考察日常代码表达能力"],
      followUps: ["什么时候 int? 比约定一个特殊值更清楚？", "?. 能减少空引用异常，但它会不会掩盖真正该处理的问题？"]
    },
    {
      difficulty: "基础",
      tags: ["try", "catch", "finally"],
      prompt: "try-catch-finally 应该怎样使用才算合理，而不是把所有异常都一把吞掉？",
      intent: ["考察异常处理习惯", "考察错误边界意识"],
      followUps: ["finally 最常见的职责是什么？", "为什么很多异常不能只打印日志然后继续装作没事？"]
    },
    {
      difficulty: "基础",
      tags: ["using", "IDisposable", "资源释放"],
      prompt: "using 语句背后依赖的是什么机制？它和垃圾回收的职责边界怎么区分？",
      intent: ["考察确定性释放理解", "考察托管资源和非托管资源边界"],
      followUps: ["为什么 GC 存在，也不代表文件句柄和数据库连接可以不手动释放？", "你会怎么向面试官解释 IDisposable 的意义？"]
    },
    {
      difficulty: "基础",
      tags: ["IEnumerable<T>", "IEnumerator<T>", "foreach"],
      prompt: "IEnumerable<T>、IEnumerator<T> 和 foreach 之间是什么关系？",
      intent: ["考察可枚举接口基础", "考察语言糖背后的运行方式"],
      followUps: ["为什么 IEnumerable<T> 更像“能产出序列的东西”，而不是“已经拿到全部数据”？", "foreach 底层大致会做哪些事情？"]
    },
    {
      difficulty: "基础",
      tags: ["foreach", "集合修改", "异常"],
      prompt: "为什么在 foreach 里直接修改集合，经常会抛异常或者行为不符合预期？",
      intent: ["考察枚举器一致性规则", "考察集合操作安全意识"],
      followUps: ["如果你确实要边遍历边删除，常见替代写法有哪些？", "List<T> 和 Dictionary<TKey, TValue> 在这类问题上的风险会一样吗？"]
    },
    {
      difficulty: "基础",
      tags: ["static", "构造函数", "初始化"],
      prompt: "静态构造函数什么时候执行？它最适合做哪些初始化，不适合做哪些重活？",
      intent: ["考察类型初始化时机", "考察静态状态设计边界"],
      followUps: ["为什么静态构造函数里抛异常会比较麻烦？", "在 Unity 项目里，静态初始化和 PlayMode 切换又会牵出什么额外问题？"]
    },
    {
      difficulty: "基础",
      tags: ["enum", "Flags", "位运算"],
      prompt: "普通 enum 和带 [Flags] 的 enum 在表达含义上有什么差异？",
      intent: ["考察枚举表达能力", "考察组合状态设计"],
      followUps: ["什么时候多个状态可以并存，适合用 Flags？", "如果枚举值设计得不好，会对日志和调试造成什么困扰？"]
    },
    {
      difficulty: "基础",
      tags: ["List<T>", "参数", "引用语义"],
      prompt: "把 List<T> 传进方法里后，方法内部改元素内容和直接把参数重新指向新列表，这两件事的效果为什么不同？",
      intent: ["考察引用传递语义", "考察对象内容与引用本身的区别"],
      followUps: ["如果想让调用方拿到新的列表引用，你会怎么设计接口？", "为什么这个点特别容易让刚接触引用类型的人犯迷糊？"]
    }
  ];

  var csharpAdvanced = [
    {
      difficulty: "进阶",
      tags: ["Generic", "Constraint", "where"],
      prompt: "泛型约束能解决什么问题？你会怎么解释 where T : class、new() 这类约束的价值？",
      intent: ["考察泛型边界控制", "考察编译期约束意识"],
      followUps: ["如果一个泛型方法需要实例化 T，为什么通常要加 new() 约束？", "约束太多会不会让接口变难用？你怎么权衡？"]
    },
    {
      difficulty: "进阶",
      tags: ["Generic", "object", "类型安全"],
      prompt: "相比把一切都塞进 object，泛型真正带来的好处到底是什么？",
      intent: ["考察泛型核心价值理解", "考察类型安全与性能意识"],
      followUps: ["泛型为什么能减少装箱拆箱？", "从代码可读性和 API 设计角度，泛型还有什么额外收益？"]
    },
    {
      difficulty: "进阶",
      tags: ["delegate", "event", "封装"],
      prompt: "delegate 和 event 都跟回调有关，但 event 为什么更适合对外暴露订阅能力？",
      intent: ["考察委托与事件区别", "考察封装边界意识"],
      followUps: ["为什么 public delegate 字段通常比 public event 更危险？", "event 在“谁可以触发通知”这件事上帮你限制了什么？"]
    },
    {
      difficulty: "进阶",
      tags: ["Action", "Func", "Predicate"],
      prompt: "Action、Func、Predicate 这几个常见泛型委托，你会怎么给一个初中级同学讲区别？",
      intent: ["考察基础函数式表达能力", "考察常用委托模型理解"],
      followUps: ["为什么 Predicate<T> 虽然本质上也像 Func<T, bool>，但仍然有自己的语义价值？", "你会在什么场景下优先写清晰命名的方法，而不是直接塞 lambda？"]
    },
    {
      difficulty: "进阶",
      tags: ["Lambda", "Closure", "for"],
      prompt: "for 循环里注册 lambda 回调时，为什么闭包经常让所有回调拿到同一个变量结果？",
      intent: ["考察闭包捕获理解", "考察常见 Bug 识别能力"],
      followUps: ["你通常怎么修这个问题？", "这个坑为什么在 UI 动态绑定和异步回调里特别常见？"]
    },
    {
      difficulty: "进阶",
      tags: ["LINQ", "Deferred Execution", "枚举"],
      prompt: "LINQ 的延迟执行是什么意思？为什么有时它会让代码看起来对，运行结果却和预想不一样？",
      intent: ["考察 LINQ 执行时机", "考察序列求值理解"],
      followUps: ["如果原集合在查询定义后又被修改，结果可能发生什么变化？", "什么时候你会主动调用 ToList 把结果落地？"]
    },
    {
      difficulty: "进阶",
      tags: ["yield return", "Iterator", "枚举器"],
      prompt: "yield return 背后大致帮你做了什么？为什么它适合表达“按需生成序列”的逻辑？",
      intent: ["考察迭代器原理基础", "考察语法糖理解"],
      followUps: ["和一次性构造完整列表相比，迭代器的优劣分别是什么？", "如果迭代过程中依赖外部可变状态，你会担心什么问题？"]
    },
    {
      difficulty: "进阶",
      tags: ["async", "await", "执行流"],
      prompt: "请你不用背定义，而是用执行流程的角度说明 async 和 await 做了什么。",
      intent: ["考察异步语义理解", "考察是否知道 await 的挂起与恢复"],
      followUps: ["为什么 await 不等于“开新线程”？", "如果一个 await 的任务已经完成，方法恢复会是什么样子？"]
    },
    {
      difficulty: "进阶",
      tags: ["async void", "异常", "事件"],
      prompt: "为什么 async void 往往被认为是危险的，通常只建议用于事件处理？",
      intent: ["考察异步错误传播理解", "考察 Task 可观测性意识"],
      followUps: ["async void 出错时为什么更难统一处理？", "如果一个方法本来能返回 Task，你为什么不该随手写成 async void？"]
    },
    {
      difficulty: "进阶",
      tags: ["Task", "Thread", "Coroutine"],
      prompt: "在 Unity 项目里，如果面试官问你 Task、Thread、Coroutine 分别适合什么工作，你会怎么回答？",
      intent: ["考察并发工具边界", "考察 Unity 语境下的合理选型"],
      followUps: ["为什么 Coroutine 更像帧调度工具，而不是通用后台并发方案？", "什么类型的工作放到 Thread 或 Task 后，仍然不能直接碰 Unity API？"]
    },
    {
      difficulty: "进阶",
      tags: ["CancellationToken", "取消", "异步"],
      prompt: "异步任务为什么要尽量支持 CancellationToken？如果不支持取消，实际项目里会出什么问题？",
      intent: ["考察异步任务生命周期控制", "考察资源和状态收敛意识"],
      followUps: ["页面关闭、场景切换、对象销毁时，为什么取消尤为重要？", "取消是不是等于强行中断线程？你会怎么解释区别？"]
    },
    {
      difficulty: "进阶",
      tags: ["Task.WhenAll", "异常", "并发"],
      prompt: "Task.WhenAll 同时等多个任务时，如果其中一个或多个失败了，你会怎么处理异常和结果收集？",
      intent: ["考察并发任务编排基础", "考察异步异常处理能力"],
      followUps: ["为什么只看第一个异常往往不够？", "如果部分任务成功、部分失败，业务上你会怎样定义可接受结果？"]
    },
    {
      difficulty: "进阶",
      tags: ["lock", "线程安全", "死锁"],
      prompt: "lock 解决的核心问题是什么？它为什么又可能引入等待和死锁风险？",
      intent: ["考察线程安全基础", "考察并发代价意识"],
      followUps: ["为什么不建议锁 public 对象或 this？", "如果锁粒度太大，会对性能和响应造成什么影响？"]
    },
    {
      difficulty: "进阶",
      tags: ["volatile", "lock", "可见性"],
      prompt: "volatile 能保证什么，不能保证什么？为什么它不能简单替代 lock？",
      intent: ["考察内存可见性基础", "考察并发原语边界"],
      followUps: ["volatile 为什么不等于复合操作的线程安全？", "如果你既要可见性又要原子性，通常还需要什么手段？"]
    },
    {
      difficulty: "进阶",
      tags: ["Reflection", "性能", "缓存"],
      prompt: "反射适合解决什么问题？如果不得不用反射，你会怎样控制它的性能成本？",
      intent: ["考察反射使用边界", "考察工具型代码和运行时代码的区分"],
      followUps: ["为什么反射更适合初始化阶段、编辑器工具或低频路径？", "你会怎样缓存反射结果，避免每帧重复查元数据？"]
    },
    {
      difficulty: "进阶",
      tags: ["Copy", "Shallow", "Deep"],
      prompt: "浅拷贝和深拷贝的区别，你会怎么用一个包含引用字段的例子讲清楚？",
      intent: ["考察对象复制语义", "考察复杂数据结构风险意识"],
      followUps: ["为什么很多“我明明复制了，改一个另一个也变了”的问题本质上都是浅拷贝？", "在项目里你会怎样明确约束一个类型的复制策略？"]
    },
    {
      difficulty: "进阶",
      tags: ["GC", "Generation", "大对象"],
      prompt: "即使你不展开讲 CLR 细节，也请说明为什么频繁分配和回收大对象会让卡顿更明显。",
      intent: ["考察垃圾回收宏观理解", "考察分配行为与卡顿关系"],
      followUps: ["为什么很多性能优化不是“把代码算得更快”，而是先把分配降下来？", "在 Unity 里，大量临时集合和字符串为什么要特别警惕？"]
    },
    {
      difficulty: "进阶",
      tags: ["IEquatable<T>", "GetHashCode", "Dictionary"],
      prompt: "如果你自定义的对象要作为 Dictionary 键或放进 HashSet，为什么常常需要实现 IEquatable<T> 并正确重写 GetHashCode？",
      intent: ["考察哈希集合相等性契约", "考察集合行为正确性"],
      followUps: ["只重写 Equals 不重写 GetHashCode 会出现什么怪问题？", "可变字段为什么不适合参与哈希计算？"]
    },
    {
      difficulty: "进阶",
      tags: ["event", "Leak", "订阅"],
      prompt: "事件订阅为什么会导致对象“逻辑上不用了，但内存上还活着”？",
      intent: ["考察事件引用链理解", "考察内存泄漏排查意识"],
      followUps: ["发布者和订阅者谁活得更久，会如何影响泄漏方向？", "除了手动解绑，你还会考虑哪些降低风险的设计方式？"]
    },
    {
      difficulty: "进阶",
      tags: ["SynchronizationContext", "Unity", "主线程"],
      prompt: "在 Unity 里用 async/await 后，为什么有时拿到结果却不能安全访问 Unity API？你会怎么把这件事讲透？",
      intent: ["考察异步恢复线程上下文理解", "考察 Unity 主线程限制"],
      followUps: ["如果 await 之后代码没有回到 Unity 主线程，你会怎样收敛？", "把异步结果派发回主线程这件事，你会自己封装还是依赖第三方库？"]
    }
  ];

  window.INTERVIEW_BANK = []
    .concat(buildGroup("U", "Unity", "运行机制与生命周期", 1, unityLifecycle))
    .concat(buildGroup("U", "Unity", "组件通信 / 场景 / Prefab / UI / 物理", 16, unitySystems))
    .concat(buildGroup("U", "Unity", "性能 / 资源 / ObjectPool / Addressables / 调试", 31, unityPerformance))
    .concat(buildGroup("U", "Unity", "项目场景与追问", 46, unityProject))
    .concat(buildGroup("C", "CSharp", "基础 / OOP / 集合 / 异常", 1, csharpBasic))
    .concat(buildGroup("C", "CSharp", "进阶 / 泛型 / 委托事件 / async-await / 内存", 21, csharpAdvanced));
})();
