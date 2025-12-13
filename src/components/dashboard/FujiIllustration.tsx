import React, {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, Defs, G, Path, Rect, Text as TextSvg, TSpan} from 'react-native-svg';
import Tooltip from 'react-native-walkthrough-tooltip';

interface FujiIllustrationProps {
    style?: any;
    currentLevel: number;
    maxLevel: number;
    kanjiRemaining: number | null;
    campProgressData: Record<number, number>;
    onCampPress?: (level: number) => void;
}

const milestones = [
    {level: 1, label: 'Base', icon: '🌲'},
    {level: 10, label: 'Camp 1', icon: '🥾'},
    {level: 20, label: 'Camp 2', icon: '⛺'},
    {level: 30, label: 'Camp 3', icon: '⛏️'},
    {level: 40, label: 'Camp 4', icon: '🧗‍♂️'},
    {level: 50, label: 'Camp 5', icon: '❄️'},
    {level: 60, label: 'Summit', icon: '🚩'},
];

export const FujiIllustration: React.FC<FujiIllustrationProps> = ({
                                                                      style,
                                                                      currentLevel,
                                                                      maxLevel,
                                                                      kanjiRemaining,
                                                                      campProgressData,
                                                                      onCampPress
                                                                  }) => {
    const pathRef = useRef<Path>(null);
    const [pathLength, setPathLength] = useState<number | null>(null);
    const [playerPos, setPlayerPos] = useState({x: 0, y: 0});
    const [milestonePositions, setMilestonePositions] = useState<{
        level: number;
        x: number;
        y: number;
        label: string;
        icon: string;
    }[]>([]);
    const [visibleTooltip, setVisibleTooltip] = useState<number | 'player' | null>(null);

    useEffect(() => {
        const calculatePaths = () => {
            if (pathRef.current) {
                const length = pathRef.current.getTotalLength();
                if (typeof length === 'number' && length > 0) {
                    setPathLength(length);

                    const progress = Math.max(0, Math.min(1, (currentLevel - 1) / (maxLevel - 1 || 1)));
                    const playerDistance = length * progress;
                    const pointPlayer = pathRef.current?.getPointAtLength(playerDistance);
                    if (pointPlayer) {
                        setPlayerPos(pointPlayer);
                    }

                    const positions = milestones.map(m => {
                        const milestoneProgress = Math.max(0, Math.min(1, (m.level - 1) / (maxLevel - 1 || 1)));
                        const milestoneDistance = length * milestoneProgress;
                        const pointMilestone = pathRef.current?.getPointAtLength(milestoneDistance);
                        return {...m, x: pointMilestone?.x ?? 0, y: pointMilestone?.y ?? 0};
                    });
                    setMilestonePositions(positions);
                } else {
                    setPlayerPos({x: 0, y: 0});
                }
            }
        };
        calculatePaths();
        const timer = setTimeout(calculatePaths, 100);
        return () => clearTimeout(timer);
    }, [currentLevel, maxLevel]);


    const isTwoDigit = currentLevel >= 10;
    const bubbleWidth = isTwoDigit ? 34 : 28;
    const bubbleHeight = 22;
    const bubbleCenterX = bubbleWidth / 2;
    const bubbleCenterY = 15;

    const progressPathData = "m 185.27017,265.48059 c -3.12395,-2.34886 1.0356,4.47982 -7.23951,0.22382 -12.79186,-6.57902 -37.2043,-11.98595 -65.1511,-16.56827 C 74.127125,242.78206 33.68335,232.29688 35.7,209.525 c 2.205921,-24.90911 36.761208,-17.63618 88.87899,-21.95085 39.02464,-3.23073 71.86616,-7.57352 69.64601,-24.79915 -1.46986,-11.40428 -27.79822,-18.26915 -51.82224,-26.43172 -18.6678,-6.3427 -35.94423,-13.46896 -39.08496,-24.11747 -5.426065,-18.39685 49.91716,-34.187855 49.91716,-34.187855"


    const SVG_VIEWBOX_WIDTH = 320.0216;
    const SVG_VIEWBOX_HEIGHT = 346.01524;

    return (
        <View style={[{width: '100%', height: '100%', position: 'relative'}, style]}>
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 320.0216 346.01524"
                preserveAspectRatio="xMidYMid meet"
                pointerEvents='box-none'
            >
                <Defs/>
                <Circle cx="216.31267" cy="83.369278" r="83.369278" fill="#f74f73" strokeWidth="1.22255" id="circle1"/>
                <Path
                    d="m 60.314751,149.75592 22.180736,-21.25626 123.315613,24.43721 14.28162,13.65227 c 0,0 38.42676,42.79654 66.17911,59.72333 v 45.36876 L 0,271.76673 0.1991997,215.98846 c 0,0 37.3773303,-32.76909 60.1155513,-66.23256 z"
                    fill="#4673aa" strokeWidth="1.28366" id="path1"/>
                <Path
                    d="M 286.27183,252.02285 V 226.31542 C 258.51948,209.38568 220.09272,166.59209 220.09272,166.59209 L 205.8609,152.95475 194.99444,152.0398 c 23.5373,32.99613 55.44218,71.92919 91.27739,99.98305 z"
                    fill="#aeb7d8" strokeWidth="1.28366" id="path2"/>
                <Rect height="74.332001" fill="#b5d4f4" width="320" x="0.021594699" y="271.68124" id="rect2"/>
                <Path
                    d="m 35.185963,252.91206 c 20.405064,-12.67641 34.341782,-1.16564 38.854932,3.32011 a 48.097918,48.097918 0 0 0 6.819525,5.02374 c 6.11342,4.14204 19.8347,7.34756 19.8347,7.34756 a 94.796063,94.796063 0 0 0 13.01266,3.07976 H -21.228405 c 0,0 5.052386,-19.88202 19.390104,-31.11757 q 0.687434,-0.53799 1.398528,-1.02865 c 0,0 16.670259,-5.10594 24.765036,0.0996 a 31.467511,31.467511 0 0 1 10.8607,13.27543 z"
                    fill="#698779" strokeWidth="1.24535" id="path3"/>
                <Path
                    d="m 359.05414,271.68123 a 43.702196,43.702196 0 0 0 -6.63072,-17.22934 c 0,0 -12.01827,-14.48619 -29.51627,-15.3975 0,0 -6.35153,-17.60467 -23.71785,-17.62706 a 23.0844,23.0844 0 0 0 -8.6838,1.81472 23.694136,23.694136 0 0 0 -13.34837,12.31326 c 0,0 -22.37458,-11.28869 -35.38317,11.66402 0,0 -11.39932,-7.41693 -22.94086,3.11057 a 44.832119,44.832119 0 0 0 -3.62813,3.80856 72.496787,72.496787 0 0 1 -10.96473,9.40285 c -5.79447,4.27737 -13.39708,8.13992 -22.00847,8.13992 z"
                    fill="#698779" strokeWidth="1.31693" id="path4"/>
                <Path
                    d="m 120.33162,77.708087 h 31.70391 c 3.43917,3.14e-4 6.71061,1.963965 8.97386,5.386462 9.24632,13.98414 35.08265,52.536461 59.08221,83.494591 -10.12199,-4.58612 -21.25422,-3.10617 -30.48238,4.0524 -4.42502,3.32239 -9.60176,4.44902 -14.59915,3.17727 -2.76998,-0.67684 -5.44195,-1.92638 -7.9176,-3.70264 -5.0002,-3.56717 -10.92202,-4.10832 -16.24609,-1.4846 -2.50883,1.20727 -4.88085,2.86267 -7.05002,4.92013 -5.34513,5.20522 -11.90972,7.74746 -18.53508,7.178 -5.12821,-0.53658 -10.04126,-2.95457 -14.18602,-6.98174 -2.63207,-2.45726 -5.6534,-4.08897 -8.83429,-4.77107 -7.943725,-1.7902 -16.111708,-0.32618 -23.407787,4.19556 0,0 -2.873565,-23.40231 -18.528996,-23.40231 0,0 23.462101,-32.75129 42.670913,-63.291804 2.25728,-3.802828 13.69947,-8.781548 17.35652,-8.770249 z"
                    fill="#c4dfe8" strokeWidth="1.28366" id="path5"/>
                <Path
                    d="M 220.09272,166.58914 C 196.09315,135.62511 170.25683,97.081641 161.01051,83.094549 a 11.919387,15.753557 0 0 0 -8.97498,-5.383512 h -31.70391 a 12.09692,15.988199 0 0 0 -1.4962,0.132818 l 29.98216,8.017711 a 12.746766,16.847083 0 0 1 7.64067,6.345696 577.0982,762.73631 0 0 0 47.50115,72.119568 35.013409,46.276348 0 0 1 16.13332,2.26231 z"
                    fill="#fffaff" strokeWidth="1.28366" id="path6"/>
                <Path d="m 235.31359,299.23123 h -113.942 a 4,4 0 0 1 0,-8 h 113.942 a 4,4 0 1 1 0,8 z" fill="#6c9bd3"
                      id="path9"/>
                <Path d="m 96.083595,299.23123 h -2.084 a 4,4 0 0 1 0,-8 h 2.084 a 4,4 0 1 1 0,8 z" fill="#6c9bd3"
                      id="path10"/>
                <Path d="M 66.628595,291.23123 H 0.0215947 v 8 H 66.628595 a 4,4 0 1 0 0,-8 z" fill="#6c9bd3"
                      id="path11"/>
                <Path
                    d="m 78.838768,173.17245 18.671277,-29.84249 a 1.9584641,2.5884532 0 0 1 3.358645,2.49989 l -9.222865,35.00168 z"
                    fill="#4673aa" strokeWidth="1.28366" id="path12"/>
                <Path
                    d="M 188.05051,171.71292 173.9136,136.96211 a 1.4135778,1.8682907 0 0 1 2.28003,-2.15753 l 28.7863,40.89138 z"
                    fill="#4673aa" strokeWidth="1.28366" id="path13"/>
                <Path
                    d="m 143.79858,173.5517 -3.29611,33.51559 a 1.8233591,2.4098884 0 0 1 -3.60096,0.12691 l -4.70075,-33.64694 z"
                    fill="#c4dfe8" strokeWidth="1.28366" id="path14"/>
                <Path
                    d="m 259.30759,298.86523 -16.486,13.275 a 34.522,34.522 0 0 1 -21.654,7.635 H 0.0215947 v 26.24 H 320.02159 v -54.784 h -39.06 a 34.531,34.531 0 0 0 -21.654,7.634 z"
                    fill="#698779" fillOpacity="1" id="path15"/>
                <Path d="m 268.29059,319.77323 h -96.146 a 4,4 0 0 1 0,-8 h 96.146 a 4,4 0 0 1 0,8 z" fill="#b5d4f4"
                      id="path16"/>
                <Path d="m 291.86159,319.77323 h -2.778 a 4,4 0 0 1 0,-8 h 2.778 a 4,4 0 0 1 0,8 z" fill="#b5d4f4"
                      id="path17"/>
                <Path
                    d="m 324.07263,238.32876 c 0,0 -7.18647,-17.96683 -24.55278,-17.98921 a 24.222224,24.222224 0 0 0 -8.91822,1.7581 c -4.37614,1.73307 -10.7988,5.37305 -13.9502,12.45416 0,0 -22.66034,-11.49413 -35.66894,11.45726 0,0 -11.61135,-6.30281 -23.15684,4.23918 a 30.403876,30.403876 0 0 0 -2.92357,3.16853 61.941624,61.941624 0 0 1 -10.6671,10.12058 c 5.35199,-1.766 11.42829,-4.58818 15.86765,-9.02753 a 14.382151,14.382151 0 0 1 7.76986,-3.97317 23.896942,23.896942 0 0 1 17.37025,3.60048 c 0,0 13.26672,-23.22926 41.37651,-8.12807 0,0 0.30421,-12.33433 11.959,-14.80752 11.6548,-2.47318 20.42421,15.96642 20.42421,15.96642 0,0 19.077,-4.19837 33.41437,7.2826 -4.97667,-7.53414 -13.58541,-14.94185 -28.3442,-16.12181 z"
                    fill="#b0d1ba" strokeWidth="1.31693" id="path20"/>
                <Path
                    d="m 81.4283,259.78764 a 42.405422,42.405422 0 0 1 -6.049905,-5.13208 c -4.50692,-4.48327 -19.453614,-16.54448 -39.858679,-3.86806 a 27.063953,27.063953 0 0 0 -10.04375,-12.3078 c -8.094777,-5.20556 -18.004029,-4.38737 -25.912003,1.05979 8.503252,-1.52056 25.163548,-1.27025 32.628177,21.21455 0,0 17.086206,-14.54694 34.267058,-1.8618 a 50.285999,50.285999 0 0 0 15.391282,8.01133 44.209934,44.209934 0 0 0 18.83467,1.69493 73.638808,73.638808 0 0 1 -19.25685,-8.81086 z"
                    fill="#b0d1ba" strokeWidth="1.24535" id="path21"/>
                <G id="g3" transform="translate(-66.264744,1.3523417)">
                    <Path
                        d="m 333.05264,271.67744 h -1.04882 a 3.3286835,3.3286835 0 0 0 -3.32207,2.8395 q -0.0146,0.10843 -0.0245,0.22172 a 1.8798302,1.8798302 0 0 0 -0.007,0.2223 4.2980896,4.2980896 0 0 0 2.69896,3.23486 l 21.95179,-0.54213 -0.26941,-6.54388 c -0.78681,-1.17516 -2.10116,-2.16403 -4.23696,-2.63706 0,0 -4.7353,-1.10002 -9.42271,1.29138 l -2.11381,0.98322 a 9.9724242,9.9724242 0 0 1 -4.20504,0.93009 z"
                        fill="#eebae0" fillOpacity="1" strokeWidth="0.19466" id="path1-1"/>
                    <Path
                        d="m 353.03078,271.1102 a 2.5878081,2.5878081 0 0 1 -0.94157,1.5894 2.6896152,2.6896152 0 0 1 -1.67155,0.54952 h -14.38108 a 2.7474292,2.7474292 0 0 0 -0.955,0.16585 4.5225324,4.5225324 0 0 0 -1.98261,1.42589 c -1.14693,1.45994 -3.32985,1.51542 -4.44895,0.1201 0.01,0.62564 0.25306,2.41826 2.63803,3.3172 h 22.33722 c 0,0 1.40272,-4.1846 -0.59449,-7.16796 z"
                        fill="#876983" fillOpacity="1" strokeWidth="0.19466" id="path2-2"/>
                    <Path
                        d="m 338.64405,301.60308 h 8.26117 a 0.31651692,0.31651692 0 0 0 0.30659,-0.39905 8.1562476,8.1562476 0 0 0 -0.66944,-1.69121 4.5939726,4.5939726 0 0 1 -0.53122,-2.17357 v -1.81579 c 0,0 0.95695,-1.35113 3.32128,-1.40738 a 12.954613,12.954613 0 0 0 1.91234,-0.1787 5.3455542,5.3455542 0 0 0 4.44876,-5.28171 h -2.64582 c 0,0 -0.0481,2.36005 -2.23858,2.71415 a 2.9416997,2.9416997 0 0 1 -0.87189,-0.004 c -0.79226,-0.10999 -2.9888,-0.28051 -4.26305,0.94916 v -1.66376 a 3.8737311,3.8737311 0 0 1 3.30046,-3.84239 q 0.039,-0.006 0.0779,-0.0105 v -5.68563 h -5.293 c 0,0 -0.96688,4.25118 -4.17078,6.47361 h -2.64075 c 0,0 -2.70208,-1.8701 -2.47686,-6.47361 h -2.87104 c 0,0 -0.16877,5.74246 2.98356,8.21873 l 5.34788,1.62911 a 21.672455,21.672455 0 0 1 0.70312,4.90407 4.6399123,4.6399123 0 0 1 -1.2285,3.26249 4.001428,4.001428 0 0 0 -1.07783,2.1218 0.31632226,0.31632226 0 0 0 0.31573,0.35447 z"
                        fill="#473b37" strokeWidth="0.19466" id="path4-7"/>
                    <Path
                        d="m 335.11682,277.46507 h -7.23551 a 2.4194273,2.4194273 0 0 0 -2.42761,2.42877 c 0,0.0194 0,0.039 6.9e-4,0.0584 0,0 -0.0958,1.76985 1.72197,1.76985 h 3.12896 a 3.7086596,3.7086596 0 0 1 1.83954,0.4884 l 0.29919,0.1711 a 3.7084649,3.7084649 0 0 0 1.83934,0.48841 v 0 a 3.7072969,3.7072969 0 0 0 2.95026,-1.46209 l 0.9441,-1.24038 z"
                        fill="#876983" fillOpacity="1" strokeWidth="0.19466" id="path5-0"/>
                    <Path
                        d="m 355.69353,277.46507 h 4.99653 a 2.4223472,2.4223472 0 0 1 1.84187,0.8491 l 0.76599,0.8968 a 2.4233205,2.4233205 0 0 0 1.16445,0.75236 v 0 a 2.4221525,2.4221525 0 0 1 1.74474,2.3256 v 0 a 2.7888917,2.7888917 0 0 1 -2.78889,2.78909 h -10.5564 z"
                        fill="#876983" fillOpacity="1" strokeWidth="0.19466" id="path7-9"/>
                    <Path
                        d="m 328.69772,285.63474 c 2.51928,-0.13626 8.30419,-0.29413 11.72611,0.84697 a 3.3935053,3.3935053 0 0 1 2.1323,2.01336 c 0.007,0.0195 0.0138,0.0378 0.0206,0.0568 a 3.1340237,3.1340237 0 0 1 0.17071,1.32485 c 0,0 -1.1917,2.2639 -2.70285,2.65496 -1.48155,0.38329 -3.80112,0.58262 -6.65736,-0.8785 -0.79052,-0.4043 -1.70192,-0.47419 -2.59988,-0.47419 l -2.70577,-0.15825 c -1.98164,0 -2.48231,-3.21948 -2.48231,-3.21948 a 2.6574963,2.6574963 0 0 1 0.17734,-0.39244 c 0.0137,-0.0247 0.0274,-0.0492 0.0417,-0.0738 a 3.5293778,3.5293778 0 0 1 2.87941,-1.70036 z"
                        fill="#eebae0" fillOpacity="1" strokeWidth="0.19466" id="path15-3"/>
                    <Path fill="#876983" fillOpacity="1" strokeWidth="0.19466"
                          d="m 340.0713,292.90431 a 3.5108851,3.5108851 0 0 0 2.67326,-3.02832 4.2186684,4.2186684 0 0 1 -1.85121,1.15433 6.4741921,6.4741921 0 0 1 -2.07839,0.32742 h -1.14713 a 5.3264776,5.3264776 0 0 1 -2.95688,-0.89368 5.2632131,5.2632131 0 0 0 -2.89595,-0.89349 h -2.69721 c -2.28609,0 -3.18191,-0.90575 -3.5175,-1.76946 -0.60617,1.70269 0.75742,3.55663 2.73905,3.55663 h 2.44805 a 5.6509756,5.6509756 0 0 1 2.56951,0.62622 c 2.85663,1.46112 5.23284,1.30364 6.7144,0.92035 z"
                          id="path31"/>
                    <Path
                        d="m 359.41504,290.18861 c 0,0 1.99779,0.0656 3.42952,-1.11948 1.96995,-1.63086 1.20688,-4.81472 -1.25614,-5.5042 -0.1098,-0.0308 -0.22561,-0.0584 -0.34474,-0.0845 1.06829,5.22779 -3.43284,4.75574 -3.43284,4.75574 h -2.24461 a 3.5085492,3.5085492 0 0 1 -1.85297,-0.52909 v 0 a 3.5106904,3.5106904 0 0 0 -1.85317,-0.52889 h -2.23683 a 1.1128704,1.1128704 0 0 1 -0.83042,-1.85764 4.304124,4.304124 0 0 1 1.36866,-0.94409 l -0.0444,-0.22231 c 0,0 -0.15009,-0.32644 -0.39147,-0.77863 a 4.0234245,4.0234245 0 0 0 -3.17081,2.90665 q -0.0286,0.10901 -0.0535,0.22308 c 0,0 -0.62193,2.17338 2.53506,2.52163 h 1.07842 a 4.4187787,4.4187787 0 0 1 2.21075,0.56062 4.4939174,4.4939174 0 0 0 2.24443,0.60072 z"
                        fill="#876983" fillOpacity="1" strokeWidth="0.19466" id="path32"/>
                    <Path
                        d="m 337.59523,274.73866 h 15.77387 a 3.6161961,3.6161961 0 0 1 2.75775,1.23239 c 0,0 0.9476,1.84207 0.90341,3.21987 -0.0532,1.66512 -0.86176,3.02151 -2.14826,4.07988 -0.82089,0.67527 -1.79088,1.20027 -3.05617,1.20027 l -4.71076,0.0728 a 5.4241969,5.4241969 0 0 1 -3.72833,-1.49128 c -0.0158,-0.0144 -2.20491,-1.51407 -3.5101,-1.5824 -2.04218,-0.10686 -4.69558,-0.25617 -5.47442,-2.07332 -0.18356,-0.42825 -0.52753,-1.21896 -0.52753,-1.21896 a 2.9736239,2.9736239 0 0 1 0.57055,-1.83759 3.82857,3.82857 0 0 1 3.14999,-1.60166 z"
                        fill="#eebae0" fillOpacity="1" strokeWidth="0.19466" id="path33"/>
                    <Path
                        d="m 356.26427,276.14371 c -0.0442,-0.0584 -0.0901,-0.11679 -0.13762,-0.17246 0.54602,2.8467 -0.80356,4.17954 -2.00791,4.79311 a 4.8538435,4.8538435 0 0 1 -2.20589,0.50611 h -3.03319 a 9.9839095,9.9839095 0 0 1 -3.92104,-0.80122 v 0 a 9.3008477,9.3008477 0 0 0 -3.65396,-0.74788 h -3.12662 c -2.78111,0 -3.87568,-0.81758 -4.30062,-1.54346 a 3.3458136,3.3458136 0 0 0 0.28264,1.20047 c 0.77864,1.81715 3.50583,2.31236 5.54781,2.41923 a 5.5583175,5.5583175 0 0 1 3.49083,1.49323 l 0.0473,0.0436 a 5.7667982,5.7667982 0 0 0 3.88346,1.44885 h 4.68118 c 1.26529,0 2.3659,-0.62291 3.18697,-1.29896 a 5.7995011,5.7995011 0 0 0 2.17533,-4.25507 4.8914128,4.8914128 0 0 0 -0.90868,-3.08556 z"
                        fill="#876983" fillOpacity="1" strokeWidth="0.19466" id="path34"/>
                </G>
                <Path fill="#eebae0" fillOpacity="1" strokeWidth="0.0950468"
                      d="m 289.96158,290.19043 c -0.24884,-0.0418 -0.80486,-0.25057 -1.23561,-0.46379 -0.98948,-0.48978 -1.47647,-0.57829 -3.18181,-0.57829 h -1.37471 l -0.32315,-0.32316 c -0.2657,-0.26568 -0.32316,-0.39468 -0.32316,-0.72535 0,-0.34815 0.0558,-0.45799 0.4152,-0.8174 l 0.41521,-0.4152 h 1.38599 c 0.76231,0 1.61266,-0.0473 1.88968,-0.10503 0.65444,-0.13648 1.51692,-0.55155 2.14515,-1.03235 l 0.50092,-0.38337 2.35048,0.002 c 2.16458,0.002 3.46909,0.0871 3.6186,0.23654 0.033,0.0329 0.0759,0.52531 0.0953,1.09406 0.0436,1.27603 -0.12184,1.89358 -0.67636,2.52355 -0.45168,0.51314 -1.06187,0.8417 -1.82519,0.98281 -0.63383,0.11717 -3.19047,0.12051 -3.87659,0.005 z"
                      id="path24-8"/>
                <Path
                    d="m 281.18115,302.71529 c 1.50993,-0.93804 2.54122,-0.0862 2.87519,0.24568 a 3.5591503,3.5591503 0 0 0 0.50463,0.37174 c 0.45238,0.30651 1.46772,0.54371 1.46772,0.54371 a 7.0147197,7.0147197 0 0 0 0.96292,0.2279 h -9.98501 c 0,0 0.37387,-1.47123 1.43482,-2.30265 q 0.0509,-0.0397 0.1035,-0.0761 c 0,0 1.23356,-0.37783 1.83256,0.007 a 2.3285333,2.3285333 0 0 1 0.80367,0.98236 z"
                    fill="#b0d1ba" fillOpacity="1" strokeWidth="0.092153" id="path3-6"/>
                <Path
                    d="m 279.44658,304.11643 h -6.53247 c -0.43693,0.004 -0.85407,-0.16505 -1.14208,-0.46336 0,0 -0.39243,-0.69258 -0.37413,-1.2106 0.022,-0.62605 0.35688,-1.13604 0.88966,-1.53396 0.33996,-0.25388 0.74166,-0.45127 1.26566,-0.45127 l 1.95088,-0.0274 c 0.57473,4.9e-4 1.1273,0.20134 1.54402,0.56069 0.007,0.005 0.91313,0.56926 1.45365,0.59496 0.84573,0.0402 1.9446,0.0963 2.26713,0.77951 0.0761,0.16102 0.21847,0.45831 0.21847,0.45831 0.007,0.2477 -0.0753,0.49073 -0.23628,0.69089 -0.30069,0.38182 -0.78753,0.60656 -1.30451,0.6022 z"
                    fill="#b0d1ba" fillOpacity="1" strokeWidth="0.0768116" id="path33-29"/>
                <Path
                    d="m 291.07248,298.59967 c -1.29676,-1.00077 -2.18244,-0.092 -2.46926,0.26212 a 3.0566565,3.7972218 0 0 1 -0.43339,0.39661 c -0.38851,0.327 -1.26051,0.58007 -1.26051,0.58007 a 6.0243563,7.4839345 0 0 1 -0.82695,0.24314 h 8.57528 c 0,0 -0.32108,-1.56963 -1.23225,-2.45666 q -0.0437,-0.0425 -0.0889,-0.0812 c 0,0 -1.05941,-0.4031 -1.57384,0.008 a 1.9997824,2.4842887 0 0 0 -0.6902,1.04807 z"
                    fill="#b0d1ba" fillOpacity="1" strokeWidth="0.0882109" id="path3-1"/>


                <Path
                    ref={pathRef}
                    d={progressPathData}
                    fill="none"
                    stroke="#ffff0096"
                    strokeWidth={4}
                    strokeDasharray="8, 8"
                    id="progressPath"
                />

                {pathLength !== null && pathLength > 0 && (
                    <>
                        <Path
                            d={progressPathData}
                            fill="none"
                            stroke="#FFFF00"
                            strokeWidth={4}
                            strokeDasharray={pathLength}
                            strokeDashoffset={pathLength - (pathLength * (currentLevel - 1)) / (maxLevel - 1 || 1)}
                        />

                        {/* Kamienie milowe */}
                        {milestonePositions.map((m) => {
                            const isPassed = currentLevel >= m.level;
                            const pillWidth = 26;
                            const pillHeight = 10;

                            return (
                                <G key={m.level} transform={`translate(${m.x}, ${m.y})`}>
                                    <Circle
                                        cx="0"
                                        cy="0"
                                        r="9"
                                        fill={isPassed ? "#FFFF00" : "#ffffffb6"}
                                    />
                                    <TextSvg
                                        x="0"
                                        y="4"
                                        fontSize="11"
                                        fill={isPassed ? "white" : "black"}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {m.icon || m.level}
                                    </TextSvg>
                                    <G transform="translate(0, 18)">
                                        {/* Tło pastylki */}
                                        <Rect
                                            x={-pillWidth / 2}
                                            y={-pillHeight / 1.5}
                                            width={pillWidth}
                                            height={pillHeight}
                                            rx={pillHeight / 2}
                                            fill={isPassed ? "#FFFF00" : "#ffffffb6"}
                                        />
                                        {/* Tekst Levelu */}
                                        <TextSvg
                                            x="0"
                                            y="1"
                                            fontSize="7"
                                            fill={"#374151"}
                                            fontWeight="800"
                                            textAnchor="middle"
                                        >
                                            {`Lvl ${m.level}`}
                                        </TextSvg>
                                    </G>
                                </G>
                            );
                        })}

                        {/* Awatar gracza */}
                        <G>
                            <Circle
                                cx={playerPos.x}
                                cy={playerPos.y}
                                r="7"
                                fill="red"
                                stroke="white"
                                strokeWidth="2"
                            />
                        </G>

                        {/* Dymek nad graczem */}
                        <G
                            transform={`translate(${playerPos.x - bubbleWidth / 2}, ${playerPos.y - 37})`}
                        >
                            {/* Tło dymka */}
                            <Rect
                                x="0"
                                y="0"
                                width={bubbleWidth}
                                height={bubbleHeight}
                                rx="8"
                                ry="8"
                                fill="#FFFFFF"
                            />

                            <Path

                                d={`M ${bubbleCenterX - 4},${bubbleHeight - 1} L ${bubbleCenterX + 4},${bubbleHeight - 1} L ${bubbleCenterX},${bubbleHeight + 7} z`}
                                fill="#FFFFFF"
                            />

                            <TextSvg
                                x={bubbleCenterX - 4}
                                y={bubbleCenterY}
                                fontSize="11"
                                fill="black"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {/* Dwa oddzielne TSpany dla różnych rozmiarów */}
                                <TSpan dx={-2} fontSize="11">🏆</TSpan>
                                <TSpan fontSize="11" dx={isTwoDigit ? 0.5 : -0.5}>{currentLevel}</TSpan>
                            </TextSvg>
                        </G>
                    </>
                )}
            </Svg>

            {pathLength !== null && pathLength > 0 && (
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} pointerEvents="box-none">
                    {milestonePositions.map((m) => {

                        const leftPercent = (m.x / SVG_VIEWBOX_WIDTH) * 100;
                        const topPercent = (m.y / SVG_VIEWBOX_HEIGHT) * 100;
                        const isReached = currentLevel >= m.level;
                        const remaining = campProgressData[m.level];

                        return (
                            <View
                                key={`tooltip-${m.level}`}
                                style={{
                                    position: 'absolute',
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: 26,
                                    height: 26,
                                    marginLeft: -13,
                                    marginTop: -13,
                                }}
                                pointerEvents="box-none"
                            >
                                <Tooltip
                                    isVisible={visibleTooltip === m.level}
                                    content={
                                        <View style={{minWidth: 120, maxWidth: 200}}>
                                            <Text style={{
                                                fontSize: 16,
                                                color: '#000',
                                                fontWeight: 'bold',
                                                textAlign: 'center'
                                            }}>
                                                {m.icon} {m.label}
                                            </Text>
                                            <View style={{
                                                marginTop: 8,
                                                width: '100%',
                                                height: 1,
                                                backgroundColor: '#eee'
                                            }}/>
                                            <View style={{marginTop: 8}}>
                                                {isReached ? (
                                                    <Text style={{color: '#4caf50', fontWeight: 'bold', fontSize: 12}}>✅
                                                        Reached!</Text>
                                                ) : (
                                                    <View>
                                                        {remaining !== undefined ? (
                                                            <>
                                                                <Text style={{
                                                                    textAlign: 'center',
                                                                    color: '#4673aa',
                                                                    fontWeight: '700',
                                                                    fontSize: 14
                                                                }}>{remaining}</Text>
                                                                <Text style={{
                                                                    textAlign: 'center',
                                                                    color: '#666',
                                                                    fontSize: 12
                                                                }}>Kanji remaining</Text>
                                                            </>
                                                        ) : (
                                                            <Text style={{
                                                                color: '#999',
                                                                fontSize: 12,
                                                                fontStyle: 'italic'
                                                            }}>Loading...</Text>
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                    }
                                    placement="top"
                                    onClose={() => setVisibleTooltip(null)}
                                    useInteractionManager={true}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        padding: 14,
                                        borderRadius: 22,
                                        minWidth: 120,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                    }}
                                    arrowStyle={{borderTopColor: '#FFFFFF'}}
                                    disableShadow={false}
                                    backgroundColor="transparent"
                                    closeOnChildInteraction={false}
                                    closeOnContentInteraction={false}
                                    showChildInTooltip={false}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            const newState = visibleTooltip === m.level ? null : m.level;
                                            setVisibleTooltip(newState);
                                            if (newState === m.level && onCampPress) {
                                                onCampPress(m.level);
                                            }
                                        }}
                                        style={{
                                            width: 26,
                                            height: 26,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {/* Transparent hitbox */}
                                        <View style={{width: 26, height: 26}}/>
                                    </TouchableOpacity>
                                </Tooltip>
                            </View>
                        );
                    })}

                    {/* Tooltip dla gracza */}
                    <View
                        style={{
                            position: 'absolute',
                            left: `${(playerPos.x / SVG_VIEWBOX_WIDTH) * 100}%`,
                            top: `${(playerPos.y / SVG_VIEWBOX_HEIGHT) * 100}%`,
                            width: 26,
                            height: 26,
                            marginLeft: -13,
                            marginTop: -13,
                        }}
                        pointerEvents="box-none"
                    >
                        <Tooltip
                            isVisible={visibleTooltip === 'player'}
                            content={
                                <View style={{minWidth: 150, maxWidth: 220}}>
                                    <Text
                                        style={{fontSize: 16, color: '#000', fontWeight: 'bold', textAlign: 'center'}}>
                                        🔴 This is you!
                                    </Text>
                                    <View style={{
                                        marginTop: 8,
                                        width: '100%',
                                        height: 1,
                                        backgroundColor: '#eee',
                                        marginBottom: 8
                                    }}/>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#666',
                                        marginTop: 6,
                                        textAlign: 'center',
                                        marginBottom: 8
                                    }}>
                                        Current level: 🏆 {currentLevel}
                                    </Text>
                                    {kanjiRemaining !== null && kanjiRemaining > 0 && (
                                        <View>
                                            <Text style={{
                                                fontSize: 14,
                                                color: '#4673aa',
                                                fontWeight: '700',
                                                textAlign: 'center'
                                            }}>
                                                {kanjiRemaining}
                                            </Text>
                                            <Text style={{textAlign: 'center', color: '#666', fontSize: 12}}>
                                                Kanji to next level
                                            </Text>
                                        </View>
                                    )}
                                    <Text style={{fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center'}}>
                                        Keep climbing!
                                    </Text>
                                </View>
                            }
                            placement="top"
                            onClose={() => setVisibleTooltip(null)}
                            useInteractionManager={true}
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                padding: 14,
                                borderRadius: 22,
                                minWidth: 150,
                                shadowColor: '#000',
                                shadowOffset: {width: 0, height: 2},
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                            arrowStyle={{borderTopColor: '#FFFFFF'}}
                            disableShadow={false}
                            backgroundColor="transparent"
                            closeOnChildInteraction={false}
                            closeOnContentInteraction={false}
                            showChildInTooltip={false}
                        >
                            <TouchableOpacity
                                onPress={() => setVisibleTooltip(visibleTooltip === 'player' ? null : 'player')}
                                style={{
                                    width: 26,
                                    height: 26,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Transparent hitbox */}
                                <View style={{width: 26, height: 26}}/>
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
            )}
        </View>
    );
};
