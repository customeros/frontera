import { observer } from 'mobx-react-lite';
import { UIStore } from '@store/UI/UI.store.ts';
import { FlowActionType } from '@store/Flows/types';
import { Node, MarkerType, useReactFlow } from '@xyflow/react';

import { cn } from '@ui/utils/cn';
import { Mail01 } from '@ui/media/icons/Mail01';
import { useStore } from '@shared/hooks/useStore';
import { CommandItem } from '@ui/overlay/CommandMenu';
import { MailReply } from '@ui/media/icons/MailReply';

import { keywords } from './keywords';
import { useUndoRedo } from '../../hooks';

const MINUTES_PER_DAY = 1440;
const DEFAULT_FIRST_EMAIL_WAIT = 30;

type WaitDurationUnit = 'days' | 'hours' | 'minutes';

interface NodeData {
  subject?: string;
  replyTo?: string;
  waitBefore?: number;
  waitStepId?: string;
  nextStepId?: string;
  bodyTemplate?: string;
  waitDuration?: number;
  messageTemplate?: string;
  action: FlowActionType | 'WAIT';
  fe_waitDurationUnit?: WaitDurationUnit;
}

interface BaseContent {
  action: FlowActionType | 'WAIT';
}

interface WaitContent extends BaseContent {
  nextStepId?: string;
  waitDuration: number;
  fe_waitDurationUnit: WaitDurationUnit;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: 'baseEdge';
  markerEnd: {
    width: number;
    height: number;
    type: MarkerType;
  };
}

const createEdge = (source: string, target: string): FlowEdge => ({
  id: `e${source}-${target}`,
  source,
  target,
  type: 'baseEdge',
  markerEnd: {
    type: MarkerType.Arrow,
    width: 20,
    height: 20,
  },
});

const createNode = (
  type: FlowActionType | 'WAIT',
  position: { x: number; y: number },
  data: Partial<NodeData> & BaseContent,
  selected: boolean = false,
): Node => ({
  id: `${type}-${crypto.randomUUID()}`,
  type: type === 'WAIT' ? 'wait' : 'action',
  position,
  data: { ...data, action: type },
  selected,
});

const useFlowNodeManagement = (ui: UIStore) => {
  const { takeSnapshot } = useUndoRedo();
  const { setEdges, setNodes, getNodes, getEdges } = useReactFlow();

  const findPreviousEmailNode = (
    nodes: Node[],
    currentNodeId: string,
  ): Node | null => {
    const currentNodeIndex = nodes.findIndex(
      (node) => node.id === currentNodeId,
    );

    for (let i = currentNodeIndex; i >= 0; i--) {
      if (nodes[i].data.action === FlowActionType.EMAIL_NEW) {
        return nodes[i];
      }
    }

    return null;
  };

  const getTypeBasedContent = (
    type: FlowActionType | 'WAIT',
    isFirstEmailNode: boolean,
    nodes: Node[],
    sourceNodeId: string,
  ): Partial<NodeData> & BaseContent => {
    const defaultWaitConfig: WaitContent = {
      action: 'WAIT',
      waitDuration: isFirstEmailNode
        ? DEFAULT_FIRST_EMAIL_WAIT
        : MINUTES_PER_DAY,
      fe_waitDurationUnit: isFirstEmailNode ? 'minutes' : 'days',
    };

    switch (type) {
      case 'WAIT':
        return defaultWaitConfig;

      case FlowActionType.EMAIL_REPLY: {
        const prevEmailNode = findPreviousEmailNode(nodes, sourceNodeId);

        return {
          action: type,
          replyTo: prevEmailNode?.id,
          subject: prevEmailNode?.data?.subject
            ? `RE: ${prevEmailNode.data.subject}`
            : '',
          bodyTemplate: '',
          waitBefore: MINUTES_PER_DAY,
        };
      }

      case FlowActionType.EMAIL_NEW: {
        return {
          action: type,
          subject: '',
          bodyTemplate: '',
          waitDuration: isFirstEmailNode
            ? DEFAULT_FIRST_EMAIL_WAIT
            : MINUTES_PER_DAY,
          fe_waitDurationUnit: isFirstEmailNode ? 'minutes' : 'days',
        };
      }

      case FlowActionType.LINKEDIN_CONNECTION_REQUEST:

      case FlowActionType.LINKEDIN_MESSAGE: {
        return {
          action: type,
          waitBefore: MINUTES_PER_DAY,
          messageTemplate: '',
        };
      }

      default:
        return { action: type };
    }
  };

  const handleAddNode = async (type: FlowActionType | 'WAIT') => {
    takeSnapshot();

    const nodes = getNodes();
    const edges = getEdges();
    const { source, target } = ui.flowCommandMenu.context.meta ?? {};

    if (!source || !target) return;

    const sourceNode = nodes.find((node) => node.id === source);

    if (!sourceNode) return;

    // Deselect all existing nodes
    const deselectedNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));

    const isFirstEmailNode =
      type === FlowActionType.EMAIL_NEW &&
      !nodes.some((node) => node.data.action === FlowActionType.EMAIL_NEW);

    const isEmailNode = [
      FlowActionType.EMAIL_NEW,
      FlowActionType.EMAIL_REPLY,
    ].includes(type as FlowActionType);
    const isLinkedInNode = [
      FlowActionType.LINKEDIN_CONNECTION_REQUEST,
      FlowActionType.LINKEDIN_MESSAGE,
    ].includes(type as FlowActionType);

    const typeBasedContent = getTypeBasedContent(
      type,
      isFirstEmailNode,
      nodes,
      source,
    );
    const newNode = createNode(
      type,
      {
        x: type === 'WAIT' ? 96.5 : 12,
        y: sourceNode.position.y + 56,
      },
      typeBasedContent,
      true, // Ensure the new node is selected
    );

    if (isEmailNode || isLinkedInNode) {
      const waitNode = createNode(
        'WAIT',
        {
          x: 96.5,
          y: sourceNode.position.y + 56,
        },
        {
          action: 'WAIT',
          waitDuration: isFirstEmailNode
            ? DEFAULT_FIRST_EMAIL_WAIT
            : MINUTES_PER_DAY,
          fe_waitDurationUnit: isFirstEmailNode ? 'minutes' : 'days',
          nextStepId: newNode.id,
        },
        false, // Ensure the wait node is not selected
      );

      newNode.data.waitStepId = waitNode.id;

      const newEdges = [
        createEdge(source, waitNode.id),
        createEdge(waitNode.id, newNode.id),
        createEdge(newNode.id, target),
      ];

      const updatedEdges = edges.filter(
        (e) => !(e.source === source && e.target === target),
      );

      setNodes([...deselectedNodes, waitNode, newNode]);
      setEdges([...updatedEdges, ...newEdges]);
    } else {
      const newEdges = [
        createEdge(source, newNode.id),
        createEdge(newNode.id, target),
      ];

      const updatedEdges = edges.filter(
        (e) => !(e.source === source && e.target === target),
      );

      setNodes([...deselectedNodes, newNode]);
      setEdges([...updatedEdges, ...newEdges]);
    }
  };

  return {
    handleAddNode,
    findPreviousEmailNode,
    hasEmailNodeBeforeCurrent: (nodes: Node[], currentNodeId: string) =>
      findPreviousEmailNode(nodes, currentNodeId) !== null,
  };
};

// Command Item Component
interface CommandItemProps {
  dataTest?: string;
  disabled?: boolean;
  keywords: string[];
  className?: string;
  onSelect?: () => void;
  children: React.ReactNode;
  leftAccessory: React.ReactNode;
}

const FlowCommandItem: React.FC<CommandItemProps> = ({
  disabled = false,
  keywords,
  leftAccessory,
  dataTest,
  className,
  onSelect,
  children,
}) => (
  <CommandItem
    disabled={disabled}
    keywords={keywords}
    dataTest={dataTest}
    onSelect={onSelect}
    className={className}
    leftAccessory={leftAccessory}
  >
    {children}
  </CommandItem>
);

// Main Component
export const StepsHub = observer(() => {
  const { ui } = useStore();
  const { getNodes } = useReactFlow();
  const { handleAddNode, hasEmailNodeBeforeCurrent } =
    useFlowNodeManagement(ui);

  const updateSelectedNode = (type: FlowActionType | 'WAIT') => {
    handleAddNode(type);
    ui.flowCommandMenu.setOpen(false);
    ui.flowCommandMenu.reset();
  };

  const currentNodeId = ui.flowCommandMenu.context.meta?.source;
  const canReplyToEmail = currentNodeId
    ? hasEmailNodeBeforeCurrent(getNodes(), currentNodeId)
    : false;

  return (
    <>
      <FlowCommandItem
        leftAccessory={<Mail01 />}
        keywords={keywords.send_email}
        dataTest='flow-action-send-email'
        onSelect={() => updateSelectedNode(FlowActionType.EMAIL_NEW)}
      >
        Send email
      </FlowCommandItem>

      <FlowCommandItem
        disabled={!canReplyToEmail}
        leftAccessory={<MailReply />}
        keywords={keywords.reply_to_previous_email}
        className={cn({ hidden: !canReplyToEmail })}
        onSelect={() => updateSelectedNode(FlowActionType.EMAIL_REPLY)}
      >
        Reply to previous email
      </FlowCommandItem>
    </>
  );
});
